import React from 'react';
import { useI18n } from '@/i18n/i18n';

export type ContextInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ContextInput({ value, onChange }: ContextInputProps) {
  const [nextOnly, setNextOnly] = React.useState(false);
  const [text, setText] = React.useState<string>(value ?? '');
  const { t } = useI18n();

  return (
    <div>
      <textarea
        placeholder={t('chat.optional_context')}
        aria-label={t('chat.optional_context')}
        value={text}
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          onChange(v);
        }}
      />
      <label>
        <input
          type="checkbox"
          aria-label={t('chat.use_once')}
          checked={nextOnly}
          onChange={(e) => {
            const checked = e.target.checked;
            setNextOnly(checked);
            onChange(value);
          }}
        />
        {t('chat.use_once')}
      </label>
    </div>
  );
}
