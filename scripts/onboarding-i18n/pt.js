import { ONBOARDING_EN } from './en.js';
import { deepMerge } from './merge.js';

export default deepMerge(ONBOARDING_EN, {
  userType: {
    title: 'Conheça o seu cliente',
    subtitle: 'Selecione o tipo de conta para iniciar a verificação',
    individualTitle: 'Individual',
    individualDescription: 'Verificação como pessoa singular. Cerca de 10 minutos.',
    individualCta: 'Continuar como individual',
    businessTitle: 'Empresa',
    businessDescription: 'Verifique a sua empresa. Cerca de 15 minutos.',
    businessCta: 'Continuar como empresa',
    privacyNote: 'Levamos a sua privacidade a sério. As suas informações estão encriptadas e seguras.',
  },
  flow: {
    changeType: 'Alterar tipo',
    saveDraft: 'Guardar rascunho',
    draftSaved: 'Progresso guardado. Pode continuar mais tarde.',
    back: 'Voltar ao passo anterior',
    stepSubtitle: 'Passo {current} de {total}',
    continue: 'Continuar para o próximo passo',
  },
  personalDetails: {
    firstNameLabel: 'Nome próprio *',
    lastNameLabel: 'Apelido *',
    dateOfBirthLabel: 'Data de nascimento *',
    nationalityLabel: 'Nacionalidade *',
    validation: {
      firstNameRequired: 'O nome próprio é obrigatório',
      lastNameRequired: 'O apelido é obrigatório',
      dateOfBirthRequired: 'A data de nascimento é obrigatória',
      nationalityRequired: 'A nacionalidade é obrigatória',
    },
  },
  terms: {
    submit: 'Concluir verificação',
    submitting: 'A enviar…',
    errorSubmit: 'Falha ao enviar KYC. Tente novamente.',
  },
  completion: {
    goDashboard: 'Ir para o painel',
    startAnother: 'Iniciar outra verificação',
  },
  compliance: {
    submit: 'Concluir verificação empresarial',
  },
});
