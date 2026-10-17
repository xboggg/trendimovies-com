# Hero phone-crop focus

Runs on OVH from /opt/trendimovies/hero-focus (cron at :17 every hour):

    cd /opt/trendimovies/hero-focus && venv/bin/python hero_focus.py

Setup (once):

    python3 -m venv venv
    venv/bin/pip install opencv-python-headless==4.10.0.84 'numpy<2.1'

plus face_detection_yunet_2023mar.onnx from opencv_zoo
(sha256 8f2383e4dd3cfbb4553ea8718107fc0423210dc964f9f4280604804ed2552fa4).

Writes /var/www/trendimovies/.cache/hero-focus.json, which src/pages/index.astro
reads (focus_x per hero backdrop) and HeroCarousel.svelte uses below 1280px only.

Run with --preview to write crop previews (red = old centre, green = new) to
/root/logo_v2/hero_focus_preview/.
