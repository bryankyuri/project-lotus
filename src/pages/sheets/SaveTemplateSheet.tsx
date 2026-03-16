import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui'

interface SaveTemplateSheetProps {
  /** What kind of template we're saving */
  readonly type: 'meal' | 'day' | 'week'
  /** Called with the user-entered name */
  readonly onSave: (name: string) => void
  readonly onCancel: () => void
}

export function SaveTemplateSheet({ type, onSave, onCancel }: SaveTemplateSheetProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')

  const titleMap = {
    meal: t('templates.save_meal'),
    day: t('templates.save_day'),
    week: t('templates.save_week'),
  }

  return (
    <div className="space-y-4 pb-4">
      <h3 className="font-bold text-text text-base">{titleMap[type]}</h3>

      <div>
        <label className="text-xs font-medium text-text-secondary mb-1.5 block">
          {t('templates.name_label')}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('templates.name_placeholder')}
          className="w-full h-11 px-4 rounded-2xl bg-white border border-border text-[16px] focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
          autoFocus
        />
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          {t('common.cancel')}
        </Button>
        <Button
          onClick={() => name.trim() && onSave(name.trim())}
          className="flex-1"
          disabled={!name.trim()}
        >
          {t('common.save')}
        </Button>
      </div>
    </div>
  )
}
