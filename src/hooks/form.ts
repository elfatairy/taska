import { createFormHook } from '@tanstack/react-form'

import {
  SubscribeButton,
  TextArea,
  TextField,
  Combobox,
  Checkbox,
} from '@/components/form-components'
import { fieldContext, formContext } from './form-context'

const formHook = createFormHook({
  fieldComponents: {
    TextField,
    TextArea,
    Combobox,
    Checkbox,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})

export const useAppForm = formHook.useAppForm
