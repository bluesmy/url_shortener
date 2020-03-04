const copyBtn = document.getElementById("copyBtn")
copyBtn.addEventListener('click', copyToClickboard)

function copyToClickboard() {
  const copyUrl = document.getElementById("copyUrl")
  copyUrl.setAttribute('type', 'text')
  copyUrl.select() // 選擇物件
  document.execCommand("Copy") // 執行瀏覽器複製命令
  copyUrl.setAttribute('type', 'hidden')
  alert('Copied to clickboard!')
}
