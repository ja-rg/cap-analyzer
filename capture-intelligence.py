from scapy.all import rdpcap, TCP, IP
from collections import defaultdict
import os


def extract_all_tcp_streams(pcap_path):
    packets = rdpcap(pcap_path)
    tcp_streams = defaultdict(list)

    # Group packets by 4-tuple (src, sport, dst, dport)
    for pkt in packets:
        if pkt.haslayer(IP) and pkt.haslayer(TCP):
            ip = pkt[IP]
            tcp = pkt[TCP]
            payload = bytes(tcp.payload)
            if not payload:
                continue

            # Canonical stream key: bi-directional
            stream_key = tuple(
                sorted([(ip.src, tcp.sport), (ip.dst, tcp.dport)]))
            tcp_streams[stream_key].append((tcp.seq, payload))

    stream_texts = []

    for i, (key, fragments) in enumerate(tcp_streams.items()):
        # Sort by sequence number
        fragments.sort(key=lambda x: x[0])
        stream_bytes = b''.join([frag[1] for frag in fragments])

        # Attempt to decode
        try:
            text = stream_bytes.decode('utf-8')
        except UnicodeDecodeError:
            text = stream_bytes.decode('latin-1')

        # Save to file
        stream_texts.append({
            "stream_index": i,
            "text": text,
        })

    return stream_texts


def extract_all_udp_streams(pcap_path):
    packets = rdpcap(pcap_path)
    udp_streams = defaultdict(list)

    # Group packets by 4-tuple (src, sport, dst, dport)
    for pkt in packets:
        if pkt.haslayer(IP) and pkt.haslayer('UDP'):
            ip = pkt[IP]
            udp = pkt['UDP']
            payload = bytes(udp.payload)
            if not payload:
                continue

            # Canonical stream key: bi-directional
            stream_key = tuple(
                sorted([(ip.src, udp.sport), (ip.dst, udp.dport)]))
            udp_streams[stream_key].append(payload)

    stream_texts = []

    for i, (key, fragments) in enumerate(udp_streams.items()):
        stream_bytes = b''.join(fragments)

        # Attempt to decode
        try:
            text = stream_bytes.decode('utf-8')
        except UnicodeDecodeError:
            text = stream_bytes.decode('latin-1')

        # Save to file
        stream_texts.append({
            "stream_index": i,
            "text": text,
        })

    return stream_texts


archivos = [
    '2017-09-19-traffic-analysis-exercise.pcap'  # 4
]
carpeta = 'Capturas'
import json

for archivo in archivos:
    pcap_path = os.path.join(carpeta, archivo)
    if not os.path.exists(pcap_path):
        print(f"Archivo {pcap_path} no encontrado.")
        continue

    print(f"Procesando {archivo}...")

    tcp_streams = extract_all_tcp_streams(pcap_path)
    udp_streams = extract_all_udp_streams(pcap_path)

    print(f"TCP Streams en {archivo}:")
    for stream in tcp_streams:
        print(f"Stream {stream['stream_index']}: {stream['text']}")

    print(f"\nUDP Streams en {archivo}:")
    for stream in udp_streams:
        print(f"Stream {stream['stream_index']}: {stream['text']}")

    # Save results to JSON
    output_data = {
        "file": archivo,
        "tcp_streams": tcp_streams,
        "udp_streams": udp_streams
    }

    with open(f"Streams/{archivo}.json", "w") as json_file:
        json.dump(output_data, json_file, indent=4)
    print(f"Resultados guardados en Streams/{archivo}.json\n")