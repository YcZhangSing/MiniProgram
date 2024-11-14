// know/rust/rust.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        current: 0,  //当前所在页面的 index
    
        indicatorDots: true, //是否显示面板指示点
    
        autoplay: true, //是否自动切换
    
        interval: 1800, //自动切换时间间隔
    
        duration: 800, //滑动动画时长
    
        circular: true, //是否采用衔接滑动
    
        imgUrls: [
    
          'https://s2.loli.net/2022/07/10/IGKLkjERzXi7wev.jpg',
          'https://s2.loli.net/2022/07/10/TGbw16NFjEVgRJY.jpg',
          'https://s2.loli.net/2022/07/10/DtdOY4mVR8pzBvU.jpg'
        ],
    
        links: [
    
          'https://baike.baidu.com/item/%E5%B0%8F%E9%BA%A6%E6%9D%A1%E9%94%88%E7%97%85/3628120',
    
          'https://baike.baidu.com/item/%E5%B0%8F%E9%BA%A6%E6%9D%A1%E9%94%88%E7%97%85/3628120',
    
          'https://baike.baidu.com/item/%E5%B0%8F%E9%BA%A6%E6%9D%A1%E9%94%88%E7%97%85/3628120'
    
        ],
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
      //轮播图的切换事件
    
      swiperChange: function(e) {
    
        this.setData({
    
          swiperCurrent: e.detail.current
    
        })
    
      },
    
      //点击指示点切换
    
      chuangEvent: function(e) {
    
        this.setData({
    
          swiperCurrent: e.currentTarget.id
    
        })
    
      },
    
      //点击图片触发事件
    
      swipclick: function(e) {
    
        console.log(this.data.swiperCurrent);
    
        wx.switchTab({
    
          url: this.data.links[this.data.swiperCurrent]
    
        })
    
      },
    

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})