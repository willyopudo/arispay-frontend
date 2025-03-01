// src/utils/swalService.js
import Swal from "sweetalert2";

class SwalService {
  // ✅ Success Toast Notification
  static toast(message, icon = "success") {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }

  // ✅ Confirmation Dialog
  static async confirm(message = "Are you sure?", confirmText = "Yes, proceed") {
    const result = await Swal.fire({
      title: "Confirm",
      text: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    return result.isConfirmed; // ✅ Returns true if user confirms
  }

  // ✅ Error Alert
  static errorMessage(message = "Something went wrong!") {
    Swal.fire({
      title: "Error",
      text: message,
      icon: "error",
      confirmButtonText: "OK",
    });
  }

  // ✅ Success Alert
  static successMessage(message = "Operation successful!") {
    Swal.fire({
      title: "Success",
      text: message,
      icon: "success",
      confirmButtonText: "OK",
    });
  }

  // ✅ Info Alert
  static infoMessage(message = "This is an information message.") {
    Swal.fire({
      title: "Info",
      text: message,
      icon: "info",
      confirmButtonText: "OK",
    });
  }
}

export default SwalService;
