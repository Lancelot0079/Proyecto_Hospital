import { useEffect, useState } from "react";

export default function AlertBox({ msg, type = "info", timeout = 3000, onHide }) {
  const [show, setShow] = useState(Boolean(msg));

  useEffect(() => {
    if (!msg) return;
    setShow(true);
    const t = setTimeout(() => {
      setShow(false);
      onHide?.();
    }, timeout);
    return () => clearTimeout(t);
  }, [msg, timeout, onHide]);

  if (!show || !msg) return null;
  return <div className={`alert alert-${type} mt-3`}>{msg}</div>;
}