const app = getApp()

Page({
    data: {
        imgList: [], // 图片集合
        image: [], // base64图片集合
        maxImg: 1, // 图片上传最高数量（根据需求设置）
        label: [],
        src: '',
        cheacked:false
    },
    onLoad: function (options) {
        console.log(options)
        let that = this;
        that.data.imgList.push(options.src);
        that.setData({
            imgList: that.data.imgList
        });
        this.setData({
            cheacked: false
        })
    },
    browse: function () {
        let that = this;
        wx.showActionSheet({
            itemList: ['从相册中选择', '拍照'],
            itemColor: "rgb(75, 187, 87)",
            success: function (res) {
                if (!res.cancel) {
                    if (res.tapIndex == 0) {
                        that.chooseWxImage('album');
                    } else if (res.tapIndex == 1) {
                        that.chooseWxImage('camera');
                    }
                }
            }
        })
    },
    /*打开相册、相机 */
    chooseWxImage: function (type) {
        let that = this;
        wx.chooseImage({
            count: that.data.maxImg - that.data.imgList.length,
            sizeType: ['original', 'compressed'],
            sourceType: [type],
            success: function (res) {
                if(that.data.cheacked){
                    that.data.imgList[0] = res.tempFilePaths[0]
                    that.setData({
                        imgList: that.data.imgList
                    })
                } else {
                    wx.navigateTo({
                        url: `/cropper/cropper?src=` + res.tempFilePaths[0]
                    })
                }
            }
        })
        
    },
    radioChange: function (e) {
        const that = this;
        console.log('radio发生change事件，携带value值为：', e.detail.value)
        
        if(e.detail.value=='whole'){    //整张图
            that.setData({
                cheacked: true
            })
        } else{
            that.setData({              //裁剪图
                cheacked: false
            })
        }
        console.log(this.data.cheacked)
    },

     onShow() {
        if (app.globalData.imgSrc) {
            this.setData({
                src: app.globalData.imgSrc
            })
        }
    },

    conversionAddress: function () {
        const that = this;
        // 判断是否有图片
        if (that.data.imgList.length !== 0) {
            for (let i = 0; i < that.data.imgList.length; i++) {
                // 转base64
                wx.getFileSystemManager().readFile({
                    filePath: that.data.imgList[i],
                    encoding: "base64",
                    success: function (res) {
                        that.data.image.push('data:image/png;base64,' + res.data);
                        //转换完毕，执行上传
                        if (that.data.imgList.length == that.data.image.length) {
                            if(that.data.cheacked){         //整张图
                                that.upCont_whole(that.data.imgList[0]);
                            } else {                        //裁剪图
                                that.upCont_cutting(that.data.imgList[0]);
                            }
                        }
                    }
                })
            }
        } else {
            wx.showToast({
                title: "请先选择图片！"
            })
        }
    },
    // 执行上传
    //整张图
    upCont_whole: function (baseImg) {
        const that = this;
        var image_a = wx.getFileSystemManager().readFileSync(baseImg, "base64");
        console.log(baseImg);
        wx.request({
            // url: "http://172.29.1.80:8009/data_cutting",
            // //  url: "http://127.0.0.1:8009/data_cutting",
            // method: "POST",
            // data: {
            //     image: image_a,
            // },
            // header: {
            //     'content-type': "application/x-www-form-urlencoded",
            // },
            // success: function (res) {
            //     console.log(res.data)
            //     if(res.data[0].name==-1){
            //         wx.showModal({
            //             title: "识别失败",   
            //         })
            //     } else if (res.data[0].name==0){
            //         wx.showModal({
            //             title: "识别成功",
            //             content: "识别结果为: 健康 正确率为: "+res.data[0].accuracy+"%"
            //         })
            //     } else if (res.data[0].name==1){
            //         wx.showModal({
            //             title: "识别成功",
            //             content: "识别结果为: 叶锈轻症 正确率为: "+res.data[0].accuracy+"%"
            //         })
            //     } else if (res.data[0].name==2){
            //         wx.showModal({
            //             title: "识别成功",
            //             content: "识别结果为: 叶锈重症 正确率为: "+res.data[0].accuracy+"%"
            //         })
            //     }
            //     else if (res.data[0].name==3){
            //         wx.showModal({
            //             title: "识别成功",
            //             content: "识别结果为: 黄矮轻症 正确率为: "+res.data[0].accuracy+"%"
            //         })
            //     }
            //     else if (res.data[0].name==4){
            //         wx.showModal({
            //             title: "识别成功",
            //             content: "识别结果为: 黄矮重症 正确率为: "+res.data[0].accuracy+"%"
            //         })
            //     }
            //     else if (res.data[0].name==5){
            //         wx.showModal({
            //             title: "识别成功",
            //             content: "识别结果为: other 正确率为: "+res.data[0].accuracy+"%"
            //         })
            //     }
            // }
            
            url: "http://172.29.1.80:8008/data_whole",
            //  url: "http://127.0.0.1:8008/data_whole",
            method: "POST",
            data: {
                image: image_a,
            },
            header: {
                'content-type': "application/x-www-form-urlencoded",
            },
            success: function (res) {
                console.log(res.data)
                var base64src = require('./base64.js')
                    //拿到后端给的base64字符串
                var shareQrImg = `data:image/jpg;base64,` + res.data[0].image
                base64src(shareQrImg, resCurrent => {
                        // this.data.src = resCurrent
                        console.log(resCurrent)
                        that.data.imgList[0] = resCurrent
                        app.globalData.respic = resCurrent
                        console.log(resCurrent)
                        wx.navigateTo({
                            url: '/res/res?name=' + resCurrent,
                          })
                        console.log(app.globalData.respic)
                        that.setData({
                            imgList: that.data.imgList
                        })
                        //resCurrent就是base64转换后的图片，直接给图片对的:src即可
                        
                    })
            }
        })
    },
    //裁剪图
    upCont_cutting: function (baseImg) {

        const that = this;
        var image_a = wx.getFileSystemManager().readFileSync(baseImg, "base64");
        console.log(baseImg);
        wx.request({
            url: "http://172.29.1.80:8009/data_cutting",
            //  url: "http://127.0.0.1:8009/data_cutting",
            method: "POST",
            data: {
                image: image_a,
            },
            header: {
                'content-type': "application/x-www-form-urlencoded",
            },
            success: function (res) {
                console.log(res.data)
                if(res.data[0].name==-1){
                    wx.showModal({
                        title: "识别失败",   
                    })
                } else if (res.data[0].name==0){
                    wx.showModal({
                        title: "识别成功",
                        content: "识别结果为: 健康 正确率为: "+res.data[0].accuracy+"%"
                    })
                } else if (res.data[0].name==1){
                    wx.showModal({
                        title: "识别成功",
                        content: "识别结果为: 叶锈 正确率为: "+res.data[0].accuracy+"%"
                    })
                } else if (res.data[0].name==2){
                    wx.showModal({
                        title: "识别成功",
                        content: "识别结果为: 黄矮 正确率为: "+res.data[0].accuracy+"%"
                    })
                }
            }
            
        })
    },

})