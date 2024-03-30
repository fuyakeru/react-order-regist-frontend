import React, { useState, useEffect } from 'react'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Box from '@mui/material/Box'

const SelectItemDivButton: React.FC = () => {
  const [div, setDiv] = useState('')
  const [divData, setDivData] = useState<mcndDivResData>([])
  const handleChange = (event: SelectChangeEvent) => {
    setDiv(event.target.value as string)
  }
  type mcndDivResData = Array<{
    MCND_DIV_ID: number
    MCND_DIV_NAME: string
  }>

  // 商品区分管理テーブル取得(初回レンダリング時のみ実行)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/getDivName') // エンドポイントにGETリクエストを送信
        if (!response.ok) {
          throw new Error('Failed to fetch data') // エラーハンドリング
        }
        const jsonData = await response.json() // JSONデータを取得
        setDivData(jsonData.results) // データをStateに設定
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData() // データを取得する関数を実行
  }, []) // 空の配列を渡すことで、コンポーネントがマウントされたときに一度だけデータを取得

  return (
    <Box sx={{ minWidth: 100 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">区分</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={div}
          label="Div"
          onChange={handleChange}
        >
          {divData &&
            divData.length > 0 &&
            divData.map((div) => (
              <MenuItem key={div.MCND_DIV_ID} value={div.MCND_DIV_ID}>
                {div.MCND_DIV_NAME}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  )
}

export default SelectItemDivButton
