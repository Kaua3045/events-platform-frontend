<template>
  <form
    class="max-w-md mx-auto mt-10 bg-surface p-6 shadow rounded-xl"
    @submit.prevent="step === 0 ? nextStep() : finalStep()"
  >
    <h2 class="text-2xl font-bold mb-4">Cadastro</h2>

    <template v-if="step === 0">
      <input
        v-model="firstName"
        v-bind="firstNameAttr"
        placeHolder="Primeiro nome"
        class="input mb-2"
      />
      <p v-if="errors.firstName" class="error">
        {{ errors.firstName }}
      </p>

      <input
        v-model="lastName"
        v-bind="lastNameAttr"
        placeHolder="Último nome"
        class="input mb-2"
      />
      <p v-if="errors.lastName" class="error">
        {{ errors.lastName }}
      </p>

      <input
        v-model="email"
        v-bind="emailAttr"
        placeHolder="Email"
        class="input mb-2"
      />
      <p v-if="errors.email" class="error">{{ errors.email }}</p>

      <input
        v-model="password"
        v-bind="passwordAttr"
        placeHolder="Senha"
        class="input mb-2"
      />
      <p v-if="errors.password" class="error">
        {{ errors.password }}
      </p>

      <div class="mb-2">
        <label
          ><input
            v-model="accountType"
            type="radio"
            value="user"
            v-bind="accountTypeAttr"
          />
          Usuário</label
        >
        <label class="ml-4"
          ><input
            v-model="accountType"
            type="radio"
            value="organizer"
            v-bind="accountTypeAttr"
          />
          Organização</label
        >
      </div>
      <p v-if="errors.accountType" class="error">
        {{ errors.accountType }}
      </p>
      <button type="submit" class="btn-primary w-full" :disabled="isSubmitting">
        {{
          accountType === "organizer"
            ? isSubmitting
              ? "Carregando..."
              : "Próximo"
            : isSubmitting
            ? "Carregando..."
            : "Cadastrar"
        }}
      </button>
    </template>

    <template v-else>
      <input
        v-model="organizationName"
        v-bind="organizationNameAttr"
        placeHolder="Nome da Organização"
        class="input mb-2"
      />
      <p v-if="errors.organizationName" class="error">
        {{ errors.organizationName }}
      </p>

      <textarea
        v-model="organizationDescription"
        v-bind="organizationDescriptionAttr"
        placeHolder="Descrição da Organização"
        class="input mb-2"
      />
      <p v-if="errors.organizationDescription" class="error">
        {{ errors.organizationDescription }}
      </p>
      <button
        v-if="accountType === 'organizer'"
        type="submit"
        class="btn-primary w-full"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? "Criando..." : "Cadastrar" }}
      </button>
    </template>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useForm } from "vee-validate";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { toast } from "vue-sonner";
import type { RegisterUserResponse } from "~/server/api/register.post";
import { useApi } from "~/server/utils/useApi";

const step = ref(0);
const isOrganizer = ref(false);

const UserStepSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  accountType: z.enum(["user", "organizer"]),
});

const OrganizationStepSchema = z.object({
  organizationName: z.string().min(2),
  organizationDescription: z.string().optional(),
});

type FormSchema = z.infer<typeof UserStepSchema> &
  z.infer<typeof OrganizationStepSchema>;

const currentSchema = computed(() =>
  toTypedSchema(step.value === 0 ? UserStepSchema : OrganizationStepSchema)
);

const { handleSubmit, errors, defineField, isSubmitting, setFieldError } =
  useForm<FormSchema>({
    validationSchema: currentSchema,
  });

const fieldMapping: Record<string, keyof FormSchema> = {
  firstName: "firstName",
  lastName: "lastName",
  email: "email",
  password: "password",
  name: "organizationName",
  description: "organizationDescription",
};

const fields = [
  "firstName",
  "lastName",
  "email",
  "password",
  "organizationName",
  "organizationDescription",
];

const [firstName, firstNameAttr] = defineField("firstName");
const [lastName, lastNameAttr] = defineField("lastName");
const [email, emailAttr] = defineField("email");
const [password, passwordAttr] = defineField("password");
const [accountType, accountTypeAttr] = defineField("accountType");
const [organizationName, organizationNameAttr] =
  defineField("organizationName");
const [organizationDescription, organizationDescriptionAttr] = defineField(
  "organizationDescription"
);

const nextStep = handleSubmit((values: FormSchema) => {
  if (step.value === 0 && values.accountType === "user") {
    submit(values);
    return;
  }

  isOrganizer.value = values.accountType === "organizer";
  if (isOrganizer.value) {
    step.value = 1;
  }
});

const finalStep = handleSubmit((values: FormSchema) => {
  submit({ ...values, ...{ isOrganizer: true } });
});

const submit = async (values: FormSchema) => {
  try {
    const response = await useApi<RegisterUserResponse>(
      "/api/register",
      "POST",
      {
        headers: {
          "Content-Type": "application/json",
        },
        body: values,
      },
      true
    );

    console.log("submit Response:", response);

    if (response.status === "success") {
      toast.success("Cadastro realizado com sucesso!", {
        classes: {
          toast: "bg-accent",
          title: "text-white",
          // icon: "hidden",
        },
      });
      navigateTo("/");
      return;
    }

    if (response.status === "error") {
      response.errors.forEach((e) => {
        const field = fieldMapping[e.field] || e.field;
        const fieldExists = fields.includes(field);
        if (fieldExists) {
          setFieldError(field, e.message); // TODO translate this
        } else {
          toast.error(e.message || "Erro ao cadastrar o usuário!", {
            classes: {
              toast: "bg-danger",
              title: "text-white",
            },
          });
        }
      });
    }
  } catch (error) {
    console.error("Error submitting form:", error); // Handle unexpected errors
    // send error to sentry
    toast.error("Erro inesperado ao cadastrar o usuário!", {
      classes: {
        toast: "bg-danger",
        title: "text-white",
      },
    });
  }
};
</script>

<style scoped>
.input {
  @apply w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary;
}

.btn-primary {
  @apply bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded disabled:opacity-50;
}

.error {
  @apply text-danger text-sm;
}
</style>
