from pydantic import BaseModel
from typing import Optional


class CapNhatTank(BaseModel):
    ten: Optional[str] = None
    nen_ho: Optional[str] = None
    day_ho: Optional[str] = None
    la_cong_khai: Optional[bool] = None
