import pyshark

from collections import defaultdict
import ipaddress


class CaptureAnalyzer:
    CARPETA = 'capturas'

    def __init__(self, file_name):
        self.file_name = file_name
        self.file_path = f'{CaptureAnalyzer.CARPETA}/{file_name}'

        # Initialize data collectors
        protocol_tree = defaultdict(lambda: defaultdict(dict))
        mac_set = set()
        mac_addresses = []
        ip_addresses = set()
        ipv6_addresses = set()
        domains = set()
        external_ips = set()
        start_time = None
        end_time = None
        total_packets = 0

        with pyshark.FileCapture(self.file_path, use_json=True, include_raw=False) as capture:
            for packet in capture:
                # Packet time tracking
                total_packets += 1
                sniff_time = packet.sniff_time
                if not start_time or sniff_time < start_time:
                    start_time = sniff_time
                if not end_time or sniff_time > end_time:
                    end_time = sniff_time

                # Protocol analysis
                current = protocol_tree
                for layer in packet.layers:
                    proto = layer.layer_name
                    current = current.setdefault(proto, {})
                    current['count'] = current.get('count', 0) + 1

                # Device discovery
                if 'ip' in packet:
                    ip_addresses.update([packet.ip.src, packet.ip.dst])
                if 'eth' in packet:
                    for mac, resolved in [(packet.eth.src, getattr(packet.eth, 'src_oui_resolved', None)),
                                          (packet.eth.dst, getattr(packet.eth, 'dst_oui_resolved', None))]:
                        if mac not in mac_set:
                            mac_addresses.append(
                                {'mac': mac, 'resolved': resolved})
                            mac_set.add(mac)
                if 'ipv6' in packet:
                    ipv6_addresses.update([packet.ipv6.src, packet.ipv6.dst])

                # External resources
                if 'dns' in packet and hasattr(packet.dns, 'qry_name'):
                    domains.add(packet.dns.qry_name)
                
                for ip_str in [getattr(packet, 'ip', None), getattr(packet, 'ipv6', None)]:
                    if ip_str:
                        for addr in [getattr(ip_str, 'src', None), getattr(ip_str, 'dst', None)]:
                            if addr:
                                try:
                                    ip_obj = ipaddress.ip_address(addr)
                                    if not ip_obj.is_private and not ip_obj.is_loopback and not ip_obj.is_link_local:
                                        external_ips.add(addr)
                                except ValueError:
                                    pass

        # Build info dict
        self.info = {
            'file': self.file_name,
            'capture_info': {
                'start_time': start_time.isoformat(),
                'end_time': end_time.isoformat(),
                'duration': (end_time - start_time).total_seconds(),
                'total_packets': total_packets
            },
            'protocols': protocol_tree,
            'device_info': {
                'mac_addresses': mac_addresses,
                'ip_addresses': list(ip_addresses),
                'ipv6_addresses': list(ipv6_addresses)
            },
            'external_resources': {
                'domains': sorted(domains),
                'external_ips': sorted(external_ips)
            }
        }

    def print_info(self):
        import json
        print(json.dumps(self.info, indent=2))


if __name__ == '__main__':
    archivos = [
        '2017-09-19-traffic-analysis-exercise.pcap',
    ]

    for archivo in archivos:
        analyzer = CaptureAnalyzer(archivo)
        analyzer.print_info()
