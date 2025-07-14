from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from analyzer import PcapAnalyzer

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = '../capturas'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    analyzer = PcapAnalyzer(file.filename)
    analyzer.run_analysis()
    return jsonify(analyzer.info)

if __name__ == '__main__':
    app.run(debug=True)
