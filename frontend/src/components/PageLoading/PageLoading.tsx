import { Spinner } from "../Spinner/Spinner"

export const PageLoading = () => (
  <div style={{ display: 'flex', "justify-content": 'center', 'align-items': 'center', "margin-top": '50px' }}>
    <Spinner size={100} />
  </div>
)
