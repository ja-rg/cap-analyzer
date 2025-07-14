import string
import codecs

def clean_escaped_ascii_from_file(input_file, output_file=None):
    # Read raw content
    with open(input_file, 'r', encoding='utf-8', errors='ignore') as f:
        raw_data = f.read()

    # Decode escape sequences (e.g., \u000f becomes actual character)
    try:
        decoded_data = codecs.decode(raw_data, 'unicode_escape')
    except Exception as e:
        print(f"Error decoding escape sequences: {e}")
        return

    # Keep only printable ASCII characters (including space)
    cleaned_data = ''.join(c for c in decoded_data if c in string.printable)

    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(cleaned_data)
        print(f"Cleaned output written to: {output_file}")
    else:
        print("Cleaned ASCII content:")
        print(cleaned_data)

# Example usage
clean_escaped_ascii_from_file('Streams/2017-09-19-traffic-analysis-exercise.pcap.json', 'Streams/2017-09-19-traffic-analysis-exercise.pcap.cleared.json')
