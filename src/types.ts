export interface IRecording {
  name: string;
  location?: string;
  parent?: string;
  url: string;
}

// value, label, description
export type Option = [string, string, string?];

export interface ISubmission extends Partial<IOptionalSubmissionDetails> {
  category_id: string;
  name: string;
  token: string;
}

export interface IOptionalSubmissionDetails {
  occupation: string;
  age_id: string;
  gender_id: string;
  location: string;
  email: string;
}
