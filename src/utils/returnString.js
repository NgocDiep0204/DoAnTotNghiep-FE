export function returnStringStatus(status) {
    switch(status) {
      case 0:
        return "Đang chờ";
      case 1:
        return "Đã xác nhận";
      case 2:
        return "Hoàn thành";
      case 3:
        return "Đã hủy";
      default:
        return "Không xác định";
    }
}
export function getDateSpace(time) {
    const date = new Date(time);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('en-GB', options);
}




