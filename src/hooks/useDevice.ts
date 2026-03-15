import { useContext } from 'react'
import { DeviceContext, type DeviceInfo } from '../contexts/DeviceContext'

/** Access device information anywhere in the component tree */
export function useDevice(): DeviceInfo {
  return useContext(DeviceContext)
}
