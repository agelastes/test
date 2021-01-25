import { ApiAction } from '.';

export type UserApiTypes = {
  '/user/signup': ApiAction<
    {
      phone: string;
      country_code?: string;
      language_code?: string;
      accept?: boolean;
      referral_code?: string;
      captcha?: {};
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      widget_id?: string;
      send_marketing_material?: boolean;
    },
    {
      key: string;
      code_length: string;
      next: string;
      timeout: number;
      // edit_token: string;
    }
  >;
  '/user/signup/verify-phone': ApiAction<
    {
      key: string;
      code: string;
    },
    {
      key: string;
      code_length: string;
      next: string;
      timeout: string;
      edit_token: string;
    }
  >;
  '/user/signup/verify-email': ApiAction<
    {
      key: string;
      code: string;
    },
    {
      token: string;
      timeout: string;
    }
  >;
  '/user/recover': ApiAction<
    {
      email: string;
    },
    {
      key: string;
      code_length: string;
      next: string;
      timeout: number;
      edit_token: string;
    }
  >;
  '/user/keep-alive': ApiAction<void, void>;
  '/user/login': ApiAction<
    {
      username: string;
      password?: string;
      captcha?: {};
    },
    {
      key: string;
      code_length: string;
      next: string;
      timeout: number;
      masked: string;
    }
  >;
  '/user/upload': ApiAction<
    {
      type:
        | 'passport'
        | 'id_card_front'
        | 'id_card_back'
        | 'driver`s_license_front'
        | 'driver`s_license_back'
        | 'selfie'
        | 'proof_of_address'
        | 'card_form'
        | 'other_documents';
      content: string;
      purpose: string;
    },
    void
  >;
};
