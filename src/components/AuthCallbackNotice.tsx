"use client";

import { useEffect, useState } from "react";

export default function AuthCallbackNotice() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(new URLSearchParams(window.location.search).get("auth") === "failed");
  }, []);

  if (!failed) return null;

  return (
    <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      Não foi possível concluir a confirmação ou a entrada. Abra o app novamente e tente entrar ou solicite um novo link.
    </p>
  );
}
