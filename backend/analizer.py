import os
import json
import socket
import ipaddress
from collections import defaultdict
from scapy.all import rdpcap, TCP, UDP, IP
import pyshark


class PcapAnalyzer:
    CARPETA = 'capturas'

    def __init__(self, file_name):
        self.file_name = file_name
        self.file_path = f'{PcapAnalyzer.CARPETA}/{file_name}'
        self.info = {
            'file': self.file_name,
            'capture_info': {},
            'protocols': {},
            'device_info': {},
            'tcp_streams': [],
            'udp_streams': []
        }

    def decode_payload(self, payloads):
        stream_bytes = b''.join(payloads)
        try:
            return stream_bytes.decode('utf-8')
        except UnicodeDecodeError:
            return stream_bytes.decode('latin-1')

    def canonical_stream_key(self, ip_src, sport, ip_dst, dport):
        return tuple(sorted([(ip_src, sport), (ip_dst, dport)]))

    def extract_streams(self, packets, protocol_cls):
        streams = defaultdict(list)
        is_tcp = (protocol_cls == TCP)

        for pkt in packets:
            if IP in pkt and protocol_cls in pkt:
                ip = pkt[IP]
                proto = pkt[protocol_cls]
                payload = bytes(proto.payload)
                if not payload:
                    continue

                key = self.canonical_stream_key(ip.src, proto.sport, ip.dst, proto.dport)

                if is_tcp:
                    streams[key].append((proto.seq, payload))
                else:
                    streams[key].append(payload)

        results = []
        for i, (key, fragments) in enumerate(streams.items()):
            if is_tcp:
                fragments.sort(key=lambda x: x[0])
                payloads = [frag[1] for frag in fragments]
            else:
                payloads = fragments

            results.append({
                "stream_index": i,
                "text": self.decode_payload(payloads),
                "ip_src": key[0][0],
                "sport": key[0][1],
                "ip_dst": key[1][0],
                "dport": key[1][1]
            })

        return results

    def analyze_with_scapy(self):
        packets = rdpcap(self.file_path)
        self.info['tcp_streams'] = self.extract_streams(packets, TCP)
        self.info['udp_streams'] = self.extract_streams(packets, UDP)

    def analyze_with_pyshark(self):
        protocol_tree = defaultdict(lambda: defaultdict(dict))
        mac_set = set()
        mac_addresses = []
        ip_info_dict = {}
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

                # MAC addresses
                if 'eth' in packet:
                    for mac, resolved in [(packet.eth.src, getattr(packet.eth, 'src_oui_resolved', None)),
                                          (packet.eth.dst, getattr(packet.eth, 'dst_oui_resolved', None))]:
                        if mac not in mac_set:
                            mac_addresses.append(
                                {'mac': mac, 'resolved': resolved, 'type': 'src' if mac == packet.eth.src else 'dst'})
                            mac_set.add(mac)

                # IP & IPv6 addresses
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

        self.info['capture_info'] = {
            'start_time': start_time.isoformat(),
            'end_time': end_time.isoformat(),
            'duration': (end_time - start_time).total_seconds(),
            'total_packets': total_packets
        }
        self.info['protocols'] = protocol_tree
        self.info['device_info'] = {
            'mac_addresses': mac_addresses,
            'ip_addresses': list(ip_info_dict.values()),
            'ipv6_addresses': list(ipv6_addresses)
        }

    def run_analysis(self):
        self.analyze_with_pyshark()
        self.analyze_with_scapy()

    def print_info(self):
        print(json.dumps(self.info, indent=2))


# Main Execution
if __name__ == '__main__':
    archivos = ['http_witp_jpegs.pcap', 'dhcp-auth.cap']
    for archivo in archivos:
        path = os.path.join(PcapAnalyzer.CARPETA, archivo)
        if not os.path.exists(path):
            print(f"Archivo no encontrado: {path}")
            continue

        analyzer = PcapAnalyzer(archivo)
        analyzer.run_analysis()
        analyzer.print_info()
