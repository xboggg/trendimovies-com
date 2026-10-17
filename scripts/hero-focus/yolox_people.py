# -*- coding: utf-8 -*-
"""Person detection with OpenCV zoo YOLOX-s (COCO; class 0 = person).

Pre/post-processing follows opencv_zoo/models/object_detection_yolox/yolox.py:
letterbox to 640x640 (pad 114, BGR, no normalisation), decode grid
outputs for strides 8/16/32, score = objectness * class prob, NMS.
"""
import cv2
import numpy as np

INPUT = 640
STRIDES = (8, 16, 32)


def _grids():
    grids, strides = [], []
    for s in STRIDES:
        n = INPUT // s
        xv, yv = np.meshgrid(np.arange(n), np.arange(n))
        grids.append(np.stack((xv, yv), 2).reshape(-1, 2))
        strides.append(np.full((n * n, 1), s))
    return np.concatenate(grids, 0).astype(np.float32), np.concatenate(strides, 0).astype(np.float32)


GRIDS, GSTRIDES = _grids()
_net = None


def people(img, model_path, conf=0.35, nms=0.45):
    """[(x1, y1, x2, y2, score)] in pixels of img, persons only."""
    global _net
    if _net is None:
        _net = cv2.dnn.readNet(model_path)
    h, w = img.shape[:2]
    r = min(INPUT / h, INPUT / w)
    canvas = np.full((INPUT, INPUT, 3), 114, np.uint8)
    canvas[:int(h * r), :int(w * r)] = cv2.resize(img, (int(w * r), int(h * r)), interpolation=cv2.INTER_LINEAR)
    blob = cv2.dnn.blobFromImage(canvas, 1.0, (INPUT, INPUT), (0, 0, 0), swapRB=False, crop=False)
    _net.setInput(blob)
    out = _net.forward()[0]                       # (8400, 85)
    out[:, :2] = (out[:, :2] + GRIDS) * GSTRIDES
    out[:, 2:4] = np.exp(out[:, 2:4]) * GSTRIDES
    scores = out[:, 4] * out[:, 5]                # objectness * P(person)
    keep = scores >= conf
    if not keep.any():
        return []
    b = out[keep, :4] / r
    s = scores[keep]
    x1, y1 = b[:, 0] - b[:, 2] / 2, b[:, 1] - b[:, 3] / 2
    boxes = [[float(a), float(c), float(bw), float(bh)] for a, c, bw, bh in zip(x1, y1, b[:, 2], b[:, 3])]
    idx = cv2.dnn.NMSBoxes(boxes, [float(v) for v in s], conf, nms)
    res = []
    for i in np.array(idx).reshape(-1):
        x, y, bw, bh = boxes[i]
        res.append((max(0.0, x), max(0.0, y), min(float(w), x + bw), min(float(h), y + bh), float(s[i])))
    return res


if __name__ == "__main__":
    import urllib.request
    M = "/opt/trendimovies/hero-focus/yolox_s.onnx"
    for name, path in (("Spider-Man", "/4tjxYg2AbOzzG9G1YuiT2NzYhlH.jpg"), ("Carrie", "/9yCJtipMeDe8uAdSJKvw8BnYfRz.jpg"),
                       ("Whalefall", "/shW2jHkQLZVv4Fko2rJDqTGU0gx.jpg"), ("LINK CLICK", "/w3agwUSMpJ4X9t1jGrDtqqRPjDQ.jpg"),
                       ("Practical Magic 2", "/oIglj0Jy9duG4LnrRUpH8n001Pk.jpg"), ("Tenzing", "/zDE9hd1SG9695YncbZGjSf7Z9Jk.jpg")):
        im = cv2.imdecode(np.frombuffer(urllib.request.urlopen("https://image.tmdb.org/t/p/w780" + path, timeout=20).read(),
                                        np.uint8), cv2.IMREAD_COLOR)
        W = im.shape[1]
        ps = people(im, M)
        print("%-18s %d person(s): %s" % (name, len(ps), [(round(p[0] / W, 2), round(p[2] / W, 2), round(p[4], 2)) for p in ps]))
