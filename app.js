//app.js
App({
  onLaunch: function () {
    var s = '{"code": 3, "data": {"duration": 0, "owner": "oqBAK0bG0dVdWCQfc8G812Q1cM-w", "enable": true, "history": null, "st": 0}}'
    console.log(JSON.parse(s))
    // 展示本地存储能力
    var self = this
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    var user = wx.getStorageSync("user") || {}
    console.log(user)
    var userInfo = wx.getStorageSync('userInfo') || {}
    console.log(userInfo)
    if (!user.openid) {
      console.log('get user info')
      wx.login({
        success: function (res) {
          if (res.code) {
            var d = self.globalData
            var l = 'https://debug.daily2fun.com/qqq/api/user?code=' + res.code
            wx.request({
              url: l,
              success: res => {
                if (res.data.code == 200) {
                  var obj = {}
                  obj.openid = res.data.data
                  console.log(obj)
                  wx.setStorageSync('user', obj)
                }
              }
            })
          } else {
            consold.log('get user login status failed.' + res.errMsg)
          }
        }
      })
    }
    /**
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
        */

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    drawConf: {
      problemNumber: 12,
      rewards: 100
    }
  },
  gData: {
    enterCode: ''
  }
})