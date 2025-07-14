import string
import re
from scapy.all import rdpcap, TCP, UDP, IP
from collections import defaultdict
import os
import json


def decode_payload(payloads):
    stream_bytes = b''.join(payloads)
    try:
        return stream_bytes.decode('utf-8')
    except UnicodeDecodeError:
        return stream_bytes.decode('latin-1')

def canonical_stream_key(ip_src, sport, ip_dst, dport):
    return tuple(sorted([(ip_src, sport), (ip_dst, dport)]))


def extract_streams(packets, protocol_cls):
    streams = defaultdict(list)
    is_tcp = (protocol_cls == TCP)

    for pkt in packets:
        if IP in pkt and protocol_cls in pkt:
            ip = pkt[IP]
            proto = pkt[protocol_cls]
            payload = bytes(proto.payload)
            if not payload:
                continue

            key = canonical_stream_key(
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
            "text": decode_payload(payloads),
            "ip_src": key[0][0],
            "sport": key[0][1],
            "ip_dst": key[1][0],
            "dport": key[1][1]
        })

    return results


def process_pcap(pcap_path):
    packets = rdpcap(pcap_path)
    tcp_streams = extract_streams(packets, TCP)
    udp_streams = extract_streams(packets, UDP)
    return tcp_streams, udp_streams


# Main execution
archivos = ['dns-zone-transfer-axfr.cap']
carpeta = 'Capturas'

for archivo in archivos:
    pcap_path = os.path.join(carpeta, archivo)
    if not os.path.exists(pcap_path):
        print(f"Archivo {pcap_path} no encontrado.")
        continue

    tcp_streams, udp_streams = process_pcap(pcap_path)

    output_data = {
        "file": archivo,
        "tcp_streams": tcp_streams,
        "udp_streams": udp_streams
    }

    print(json.dumps(output_data, indent=2))
