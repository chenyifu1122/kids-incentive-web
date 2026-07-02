import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// 隐藏首屏加载动画
const splash = document.getElementById('splash')
if (splash) {
  splash.classList.add('hide')
  setTimeout(() => splash.remove(), 500)
}
