import { useTranslation } from "react-i18next"

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="mt-auto border-t bg-black text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <p className="text-xs text-gray-400">{t("Description")}</p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Made by</span>
            <a
              href="https://shmbrt.de/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 font-medium transition-colors hover:text-gray-300"
            >
              <span className="font-mono">shmbrt</span>
              <span className="animate-pulse">_</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
