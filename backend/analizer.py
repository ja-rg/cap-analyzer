import os
import json
import socket
import ipaddress
from manuf import MacParser
from collections import defaultdict
from scapy.all import rdpcap, TCP, UDP, IP, IPv6, Ether
from datetime import datetime


class PcapAnalyzer:

    def __init__(self, file_path):
        self.file_path = file_path  # full path already
        self.file_name = os.path.basename(file_path)
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

                key = self.canonical_stream_key(
                    ip.src, proto.sport, ip.dst, proto.dport)

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

    def analyze(self):
        packets = rdpcap(self.file_path)
        total_packets = len(packets)
        protocol_tree = defaultdict(lambda: defaultdict(dict))
        mac_set = set()
        mac_addresses = []
        ip_info_dict = {}
        ipv6_addresses = set()

        start_time = None
        end_time = None

        tcp_streams = defaultdict(list)
        udp_streams = defaultdict(list)

        for pkt in packets:
            # Timestamps
            ts = datetime.fromtimestamp(float(pkt.time))
            if not start_time or ts < start_time:
                start_time = ts
            if not end_time or ts > end_time:
                end_time = ts

            # Protocol tree
            layers = set()
            if pkt.haslayer(Ether):
                layers.add("eth")
            if pkt.haslayer(IP):
                layers.add("ip")
            if pkt.haslayer(IPv6):
                layers.add("ipv6")
            if pkt.haslayer(TCP):
                layers.add("tcp")
            if pkt.haslayer(UDP):
                layers.add("udp")
            for proto in layers:
                current = protocol_tree.setdefault(proto, {})
                current['count'] = current.get('count', 0) + 1

            # MAC addresses
            parser = MacParser()  # Create a MAC-to-vendor parser
            if pkt.haslayer(Ether):
                eth = pkt[Ether]
                for mac, label in [(eth.src, 'src'), (eth.dst, 'dst')]:
                    if mac not in mac_set:
                        vendor = parser.get_manuf(mac)  # ← resolve vendor (fabricante)
                        mac_addresses.append({
                            'mac': mac,
                            'resolved': vendor,
                            'type': label
                        })
                        mac_set.add(mac)

            # IP & IPv6 address collection
            for layer in [pkt.getlayer(IP), pkt.getlayer(IPv6)]:
                if layer:
                    for addr in [layer.src, layer.dst]:
                        if addr and addr not in ip_info_dict:
                            try:
                                ip_obj = ipaddress.ip_address(addr)
                                is_private = ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local
                                is_ipv6 = isinstance(
                                    ip_obj, ipaddress.IPv6Address)
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

            # TCP & UDP stream collection
            if pkt.haslayer(IP) and pkt.haslayer(TCP):
                ip = pkt[IP]
                tcp = pkt[TCP]
                payload = bytes(tcp.payload)
                if payload:
                    key = self.canonical_stream_key(
                        ip.src, tcp.sport, ip.dst, tcp.dport)
                    tcp_streams[key].append((tcp.seq, payload))

            elif pkt.haslayer(IP) and pkt.haslayer(UDP):
                ip = pkt[IP]
                udp = pkt[UDP]
                payload = bytes(udp.payload)
                if payload:
                    key = self.canonical_stream_key(
                        ip.src, udp.sport, ip.dst, udp.dport)
                    udp_streams[key].append(payload)

        # Finalize TCP and UDP stream processing
        def format_streams(streams, is_tcp):
            results = []
            for i, (key, frags) in enumerate(streams.items()):
                if is_tcp:
                    frags.sort(key=lambda x: x[0])
                    payloads = [frag[1] for frag in frags]
                else:
                    payloads = frags
                results.append({
                    "stream_index": i,
                    "text": self.decode_payload(payloads),
                    "ip_src": key[0][0],
                    "sport": key[0][1],
                    "ip_dst": key[1][0],
                    "dport": key[1][1]
                })
            return results

        self.info['tcp_streams'] = format_streams(tcp_streams, is_tcp=True)
        self.info['udp_streams'] = format_streams(udp_streams, is_tcp=False)

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
        analyzer.analyze()
        analyzer.print_info()
