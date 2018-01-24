// pages/cli/managerProblems.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    onlineCliNum: 0,
    roomExist: false,
    watingResponse: true,
    debugTimer: null
  },

  goBackTap: ()=> {
    wx.navigateBack({
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    self = this
    console.log('onLoad..')
    self.data.debugTimer = setInterval(()=>{
      console.log('timer evnet.')
      self.setData({ watingResponse: false})
      clearInterval(self.data.debugTimer)
    }, 2000)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   * 打开ws连接
   */
  onShow: function () {
    console.log('open ws conn.')
  },

  /**
   * 生命周期函数--监听页面隐藏
   * 断开ws连接
   */
  onHide: function () {
    console.log('onHide: close ws conn.')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('onUnload: close ws conn.')
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