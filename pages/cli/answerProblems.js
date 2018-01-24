// pages/cli/answerProblems.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roomStatus: '等待中...',
    problem: null,
    ready: false,
    choicedIdx: undefined,
    debugTimer: null
  },

  clickChoiceTap: function (e) {
    console.log(e)
    if (typeof (this.data.choicedIdx) == 'undefined') {
      var pb = this.data.problem
      var choiced = pb.choice[parseInt(e.currentTarget.id)]
      choiced.cls = 'selected'
      this.setData({
        problem: pb,
        choicedIdx: choiced
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    self = this;
    this.data.debugTimer = setInterval(() => {
      self.setData({
        ready: true,
        problem: {
          content: '测试问题',
          choice: [
            { idx: 0, val: "选项1", cls: 'unselect' },
            { idx: 1, val: "选项2", cls: 'unselect' },
          ]
        }
      })
      clearInterval(self.data.debugTimer)
    }, 1000)
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