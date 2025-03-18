from flask import Flask, Response, request,send_file
from Init import Generate_Audio
from flask_cors import CORS
import os
app = Flask(__name__)
CORS(app, origins=['*'])


@app.route('/tts', methods=['OPTIONS','GET','POST'])
def get_audio_chunk():
    CHUNK_SIZE = 10**6
    TEMP_DIR="Inference/"
    if request.method=='POST':
      data=request.json
      text=data.get('text',False)
      text=text[:800] 
      if not text:
          return "Missing text parameter ", 400
      id=data.get('id',False)
      if not id:
        return "Missing id parameter", 400
      Generate_Audio(text,id)
      return  "done ",200
    if request.method=='GET':
      range_header = request.headers.get("Range")
      if not range_header:
          return "Requires Range header", 400

      # Check for audio file existence based on request data
      audio_id = request.args.get("id")  # Retrieve ID from query string
      audio_path = os.path.join(f"{TEMP_DIR+audio_id}.wav")
      if not audio_id or not os.path.exists(audio_path):
          return "Audio not found, you need to resend the book", 404

      # Get audio stats
      audio_size = os.path.getsize(audio_path)

      # Parse Range
      # Example: "bytes=32324-"

      try:
          start = int(range_header.replace("bytes=", "").split("-")[0])
          end = min(start + CHUNK_SIZE, audio_size - 1)
      except ValueError:
          return "Invalid Range format", 400

      content_length = end - start + 1
      headers = {
            "Content-Range": f"bytes {start}-{end}/{audio_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": content_length,
            "Content-Type": "audio/wav",
        }
            # HTTP Status 206 for Partial Content
      with open(audio_path, 'rb') as f:
        f.seek(start)  # Seek to the starting byte position
        audio_chunk = f.read(end - start + 1)  # Read the desired chunk size
      return Response(audio_chunk, headers=headers, mimetype="audio/wav", status=206)
    if request.method == 'OPTIONS':
        # Set allowed methods for the actual resource
        allowed_methods = ['GET', 'POST']  # Adjust based on your needs
        headers = {
            'Allow': ','.join(allowed_methods),
            'Access-Control-Allow-Origin': '*',  # Adjust for specific origins if needed
            'Access-Control-Allow-Headers': 'Content-Type, Range',  # Allowed headers for requests
        }
        return '', 200, headers  # Return empty response with headers


@app.route('/getfile',methods=['GET'])
def download_file():
    TEMP_DIR="Inference/"
    audio_id = request.args.get("id")
    if not audio_id:
        return 'missing audio ID as arguments ',400
    path=f"{TEMP_DIR+audio_id}.wav"
    if not os.path.exists(path):
        return 'file not found ',404
    try:
        return send_file(path, as_attachment=True)
    except Exception as e:
        return f"An error occurred: {e}", 500 
    
@app.route('/done', methods=['POST'])
def remove_audio():
    data=request.json
    id=data.get('id',False)
    TEMP_DIR="Inference/"
    if not id:
        return 'Missing ID file number ',400
    path=f"{TEMP_DIR+id}.wav"
    os.remove(path)
    if os.path.exists(path):
        return 'file removed successfuly ',200
    else:
        return 'could not remove the file (file still exists)',422
    

if __name__ == '__main__':
    app.run(host='192.168.100.42', port=5000)
