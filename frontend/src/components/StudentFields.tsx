import type { CourseConfig, FieldConfig } from '../config/courses'
import type { FormState } from '../utils/studentForm'
import Field, { inputCls } from './Field'

interface Props {
  config: CourseConfig
  form: FormState
  errors: Record<string, string>
  onChange: (key: string, value: string) => void
}

export default function StudentFields({ config, form, errors, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {config.fields.map((f) => (
        <Field
          key={f.key}
          label={f.label}
          required={f.required}
          error={errors[f.key]}
          className={f.fullWidth ? 'sm:col-span-2' : ''}
        >
          <Input field={f} value={form[f.key]} onChange={(v) => onChange(f.key, v)} error={errors[f.key]} />
        </Field>
      ))}
    </div>
  )
}

function Input({
  field,
  value,
  onChange,
  error,
}: {
  field: FieldConfig
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  if (field.type === 'select') {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls(error)}>
        <option value="">Select {field.label.toLowerCase()}</option>
        {field.options?.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    )
  }
  if (field.type === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={2}
        className={inputCls(error) + ' resize-none'}
      />
    )
  }
  return (
    <input
      type={field.type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className={inputCls(error)}
    />
  )
}
