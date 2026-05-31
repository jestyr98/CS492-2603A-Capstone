function createNotificationService() {
  const sentNotifications = []

  function sendOrderNotification({ channel, recipient, orderNumber, status }) {
    const notification = {
      id: `ntf_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      channel,
      recipient,
      orderNumber,
      status,
      sentAt: new Date().toISOString(),
    }

    sentNotifications.push(notification)
    return notification
  }

  return {
    sendOrderNotification,
    sentNotifications,
  }
}

module.exports = { createNotificationService }
