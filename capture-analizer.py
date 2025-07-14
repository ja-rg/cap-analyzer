import pyshark

class CaptureAnalyzer:
    CARPETA = 'Capturas'

    def __init__(self, file_name):
        self.file_name = file_name
        self.file_path = f'{CaptureAnalyzer.CARPETA}/{file_name}'

        with pyshark.FileCapture(self.file_path) as capture:
            self.capture = list(capture)
            self.info = {
                'file': self.file_name,
                'capture_info': self.get_capture_time(),
                'protocol_info': self.discover_protocols(),
                'device_info': self.discover_devices(),
                'external_resources': self.discover_external_resources()
            }

    def get_capture_time(self):
        start_time = self.capture[0].sniff_time
        end_time = self.capture[-1].sniff_time
        return {
            'start_time': start_time.isoformat(),
            'end_time': end_time.isoformat(),
            'duration': (end_time - start_time).total_seconds(),
            'total_packets': len(self.capture)
        }

    def discover_protocols(self):
        from collections import defaultdict

        def tree():
            return defaultdict(tree)

        def increment_count(node, protocol):
            if 'count' not in node[protocol]:
                node[protocol]['count'] = 0
            node[protocol]['count'] += 1

        protocol_tree = tree()

        for packet in self.capture:
            current = protocol_tree
            for layer in packet.layers:
                proto = layer.layer_name
                increment_count(current, proto)
                current = current[proto]

        def convert(d):
            if isinstance(d, defaultdict):
                return {k: convert(v) for k, v in d.items()}
            return d

        return {
            'protocols': convert(protocol_tree)
        }

    def discover_devices(self):
        mac = set()
        mac_addresses = list()
        ip_addresses = set()
        ipv6_addresses = set()

        for packet in self.capture:
            if 'ip' in packet:
                ip_addresses.add(packet.ip.src)
                ip_addresses.add(packet.ip.dst)
            if 'eth' in packet:
                if packet.eth.addr not in mac:
                    mac_addresses.append({
                        'mac': packet.eth.src,
                        'resolved': packet.eth.src_oui_resolved if hasattr(packet.eth, 'src_oui_resolved') else None
                    })
                if packet.eth.dst not in mac:
                    mac_addresses.append({
                        'mac': packet.eth.dst,
                        'resolved': packet.eth.dst_oui_resolved if hasattr(packet.eth, 'dst_oui_resolved') else None
                    })
                mac.add(packet.eth.src)
                mac.add(packet.eth.dst)
            if 'ipv6' in packet:
                ipv6_addresses.add(packet.ipv6.src)
                ipv6_addresses.add(packet.ipv6.dst)

        return {
            'mac_addresses': mac_addresses,
            'ip_addresses': list(ip_addresses),
            'ipv6_addresses': list(ipv6_addresses)
        }

    def discover_external_resources(self):
        import ipaddress

        domains = set()
        external_ips = set()

        for packet in self.capture:
            if 'dns' in packet and hasattr(packet.dns, 'qry_name'):
                domains.add(packet.dns.qry_name)

            if 'ip' in packet:
                for ip_str in [packet.ip.src, packet.ip.dst]:
                    try:
                        ip = ipaddress.ip_address(ip_str)
                        if not ip.is_private and not ip.is_loopback:
                            external_ips.add(ip_str)
                    except ValueError:
                        pass

            if 'ipv6' in packet:
                for ip_str in [packet.ipv6.src, packet.ipv6.dst]:
                    try:
                        ip = ipaddress.ip_address(ip_str)
                        if not ip.is_private and not ip.is_loopback and not ip.is_link_local:
                            external_ips.add(ip_str)
                    except ValueError:
                        pass

        return {
            'domains': sorted(list(domains)),
            'external_ips': sorted(list(external_ips))
        }

    def print_info(self):
        from pprint import pprint
        pprint(self.info)


if __name__ == '__main__':
    archivos = [
        '2017-09-19-traffic-analysis-exercise.pcap'
    ]
    import json
    for archivo in archivos:
        analyzer = CaptureAnalyzer(archivo)
        analyzer.print_info()
        with open(f'{CaptureAnalyzer.CARPETA}/{archivo}.json', 'w', encoding='utf-8') as f:
            json.dump(analyzer.info, f, indent=4, ensure_ascii=False)
        print(f'Información de {archivo} guardada en JSON.')
