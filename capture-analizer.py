import pyshark
from collections import defaultdict
import ipaddress
import socket


class CaptureAnalyzer:
    CARPETA = 'capturas'

    def __init__(self, file_name):
        self.file_name = file_name
        self.file_path = f'{CaptureAnalyzer.CARPETA}/{file_name}'

        # Initialize data collectors
        protocol_tree = defaultdict(lambda: defaultdict(dict))
        mac_set = set()
        mac_addresses = []
        ip_info_dict = {}  # IP -> {ip, resolved, is_private}
        ipv6_addresses = set()
        start_time = None
        end_time = None
        total_packets = 0

        with pyshark.FileCapture(self.file_path, include_raw=False) as capture:
            for packet in capture:
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

                # MAC address discovery
                if 'eth' in packet:
                    for mac, resolved in [(packet.eth.src, getattr(packet.eth, 'src_oui_resolved', None)),
                                          (packet.eth.dst, getattr(packet.eth, 'dst_oui_resolved', None))]:
                        if mac not in mac_set:
                            mac_addresses.append(
                                {'mac': mac, 'resolved': resolved, 'type': 'src' if mac == packet.eth.src else 'dst'})
                            mac_set.add(mac)


                # IP (v4 y v6) discovery
                # IP (v4 y v6) discovery
                for ip_layer in [getattr(packet, 'ip', None), getattr(packet, 'ipv6', None)]:
                    if ip_layer:
                        for addr in [getattr(ip_layer, 'src', None), getattr(ip_layer, 'dst', None)]:
                            if addr and addr not in ip_info_dict:
                                try:
                                    ip_obj = ipaddress.ip_address(addr)
                                    is_private = ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local
                                    is_ipv6 = isinstance(ip_obj, ipaddress.IPv6Address)

                                    try:
                                        resolved = socket.gethostbyaddr(addr)[0]
                                    except Exception:
                                        resolved = None

                                    ip_info_dict[addr] = {
                                        'ip': addr,
                                        'resolved': resolved,
                                        'is_private': is_private,
                                        'is_ipv6': is_ipv6
                                    }

                                    if is_ipv6:
                                        ipv6_addresses.add(addr)

                                except ValueError:
                                    continue

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
                'ip_addresses': list(ip_info_dict.values()),
                'ipv6_addresses': list(ipv6_addresses)
            }
        }

    def print_info(self):
        import json
        print(json.dumps(self.info, indent=2))


if __name__ == '__main__':
    archivos = [
        'dhcp-auth.cap',
    ]

    for archivo in archivos:
        analyzer = CaptureAnalyzer(archivo)
        analyzer.print_info()
