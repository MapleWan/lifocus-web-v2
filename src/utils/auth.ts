import Cookies from 'js-cookie'

// token 过期时间刷新阈值（30 分钟）
// const EXPIRE_THRESHOLD = 30 * 60 * 1000

/*
 * 设置 token
 * @param accessToken 访问token
 * @param refreshToken 刷新token
 * @param expireTime 过期时间
 */
export function setToken(accessToken: string, refreshToken: string, expireTime: string) {
  const isRemember = Cookies.get('isRemember')
  if (isRemember === 'true') {
    Cookies.set('accessToken', accessToken, { expires: 1 / 24 })
    Cookies.set('refreshToken', refreshToken, { expires: 1 / 24 })
    Cookies.set('expiryTime', expireTime, { expires: 1 / 24 })
  } else {
    sessionStorage.setItem('accessToken', accessToken)
    sessionStorage.setItem('refreshToken', refreshToken)
    sessionStorage.setItem('expireTime', expireTime)
  }
}

/*
 * 获取 token
 */
export function getToken() {
  const isRemember = Cookies.get('isRemember')
  if (isRemember === 'true') {
    return {
      accessToken: Cookies.get('accessToken'),
      refreshToken: Cookies.get('refreshToken'),
      expireTime: Cookies.get('expiryTime'),
    }
  } else {
    return {
      accessToken: sessionStorage.getItem('accessToken'),
      refreshToken: sessionStorage.getItem('refreshToken'),
      expireTime: sessionStorage.getItem('expireTime'),
    }
  }
}

/*
 * 获取刷新 token
 */
export function getRefreshToken() {
  const isRemember = Cookies.get('isRemember')
  if (isRemember === 'true') {
    return Cookies.get('refreshToken')
  } else {
    return sessionStorage.getItem('refreshToken')
  }
}

/*
 * 移除 token
 */
export function removeToken() {
  Cookies.remove('accessToken')
  Cookies.remove('refreshToken')
  Cookies.remove('expiryTime')
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('refreshToken')
  sessionStorage.removeItem('expireTime')
}
