# HYSI REMOVER AI - Neural Backend Integration

This microservice provides high-throughput video and photo object removal using deep neural models and FFmpeg.

## Architecture
- **Inpainting Model**: ProPainter (Video) / LaMa Large (Photo)
- **Video Engine**: FFmpeg 6.0+ (Lossless H.264/HEVC encoding, AAC audio preserve)
- **Optical Flow**: RAFT (Recurrent All-Pairs Field Transforms) for temporal consistency
- **Super Resolution**: Real-ESRGAN-4x+
- **Background Extraction**: BiRefNet (RMBG-1.4)

## Running the Microservice
```bash
cd python_backend
pip install -r requirements.txt
python app.py
```

The service runs at `http://localhost:8000`. The frontend will automatically detect and link to this service via `/api/backend-status`.
