//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var self = this
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    var user = wx.getStorageSync("user") || null
    var userInfo = wx.getStorageSync('userInfo') || {}
    if (!user.openid) {
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
                  wx.setStorageSync('user', obj)
                  self.globalData.openid = obj.openid
                  if (self.openidReadyCallback) {
                    self.openidReadyCallback(obj.openid)
                  }
                }
              }
            })
          } else {
            consold.log('get user login status failed.' + res.errMsg)
          }
        }
      })
    } else {
      self.globalData.openid = user.openid
    }

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
    },
    openid: null,
    registerStat: 0
  },
  gData: {
    enterCode: ''
  }
})