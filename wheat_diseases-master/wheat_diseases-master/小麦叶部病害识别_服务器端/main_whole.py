# -*- coding:utf-8 -*-
from flask import Flask, request, jsonify
import base64
from frcnn import FRCNN
from PIL import Image
from io import BytesIO

frcnn = FRCNN()
app = Flask(__name__)
num = 0

# 设置允许的文件格式
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'JPG', 'PNG', 'bmp'])


def pil_base64(image):
    img_buffer = BytesIO()
    image.save(img_buffer, format='JPEG')
    byte_data = img_buffer.getvalue()
    base64_str = base64.b64encode(byte_data)
    base64_str = base64_str.decode('utf-8')
    return base64_str


# 添加路由
@app.route('/data_whole', methods=['POST', 'GET'])
def data():
    if request.method == 'POST':
        # 通过file标签获取文件

        # 获取图片
        team_image = base64.b64decode(request.form.get('image'))  # 队base64进行解码还原。
        global num
        file = 'img/' + str(num) + '.jpg'
        output_file = open(file, 'wb')
        output_file.write(team_image)
        output_file.close()
        num = num + 1

        # 图片识别
        image = Image.open(file)
        top = frcnn.detect_image(image)
        new_top = pil_base64(top)
        print(type(new_top))
        a = [{'image': new_top}]
        return jsonify(a)


if __name__ == '__main__':
    app.run(host='172.29.1.80' ,port=8008, debug=False)
