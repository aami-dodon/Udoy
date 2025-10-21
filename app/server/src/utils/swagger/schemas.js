export const schemas = {
  StandardSuccessResponse: {
    type: 'object',
    required: ['status', 'message'],
    properties: {
      status: {
        type: 'string',
        example: 'success',
      },
      message: {
        type: 'string',
        example: 'Operation completed successfully.',
      },
    },
  },
  ErrorResponse: {
    type: 'object',
    required: ['status', 'message'],
    properties: {
      status: {
        type: 'string',
        enum: ['error'],
      },
      message: {
        type: 'string',
        example: 'An unexpected error occurred.',
      },
    },
  },
  AdminOverviewResponse: {
    allOf: [
      { $ref: '#/components/schemas/StandardSuccessResponse' },
      {
        type: 'object',
        required: ['permissions'],
        properties: {
          user: {
            type: 'object',
            nullable: true,
            additionalProperties: true,
            description:
              'Decoded user payload injected by the authentication middleware. Structure varies based on token claims.',
          },
          permissions: {
            type: 'object',
            required: ['resource', 'action'],
            properties: {
              resource: {
                type: 'string',
                example: 'admin:dashboard',
              },
              action: {
                type: 'string',
                example: 'read',
              },
            },
          },
        },
      },
    ],
  },
  EmailTestRequest: {
    type: 'object',
    required: ['to'],
    properties: {
      to: {
        type: 'string',
        format: 'email',
        description: 'Destination email address that will receive the rendered template.',
        example: 'test@example.com',
      },
      type: {
        type: 'string',
        description: 'Template type to render. Defaults to `verification`.',
        enum: ['verification', 'passwordReset'],
        example: 'verification',
      },
      name: {
        type: 'string',
        description: 'Name injected into the email template variables.',
        example: 'Udoy Tester',
      },
      template: {
        type: 'string',
        nullable: true,
        description: 'Optional override for the HTML template identifier.',
      },
      textTemplate: {
        type: 'string',
        nullable: true,
        description: 'Optional override for the plaintext template identifier.',
      },
      variables: {
        type: 'object',
        additionalProperties: true,
        description: 'Additional template variables merged with defaults.',
        example: {
          organization: 'Udoy',
        },
      },
    },
  },
  EmailTestResponse: {
    allOf: [
      { $ref: '#/components/schemas/StandardSuccessResponse' },
      {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Test verification email sent to test@example.com.',
          },
        },
      },
    ],
  },
  NotificationTemplate: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      eventKey: { type: 'string' },
      channel: {
        type: 'string',
        enum: ['IN_APP', 'EMAIL', 'SMS'],
      },
      locale: { type: 'string', example: 'en-US' },
      subject: { type: 'string', nullable: true },
      body: { type: 'string' },
      previewText: { type: 'string', nullable: true },
      audienceRoles: {
        type: 'array',
        items: { type: 'string' },
      },
      active: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  NotificationDispatchRecipient: {
    type: 'object',
    properties: {
      userId: { type: 'string', nullable: true, description: 'Recipient user identifier. Optional when `recipient` is provided.' },
      recipient: { type: 'string', format: 'email', nullable: true },
      channels: {
        type: 'array',
        items: { type: 'string', enum: ['IN_APP', 'EMAIL', 'SMS'] },
        description: 'Overrides the default channel list when provided.',
      },
      locale: { type: 'string', nullable: true },
      data: { type: 'object', nullable: true, additionalProperties: true },
      metadata: { type: 'object', nullable: true, additionalProperties: true },
      idempotencyKey: { type: 'string', nullable: true },
    },
  },
  NotificationDispatchRequest: {
    type: 'object',
    required: ['eventKey', 'recipients'],
    properties: {
      eventKey: { type: 'string' },
      priority: {
        type: 'string',
        enum: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'],
        default: 'NORMAL',
      },
      forceDelivery: { type: 'boolean', default: false },
      scheduleAt: { type: 'string', format: 'date-time', nullable: true },
      metadata: { type: 'object', nullable: true, additionalProperties: true },
      recipients: {
        type: 'array',
        minItems: 1,
        items: { $ref: '#/components/schemas/NotificationDispatchRecipient' },
      },
    },
  },
  NotificationLogEntry: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      status: {
        type: 'string',
        enum: ['PENDING', 'SCHEDULED', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED'],
      },
      attempt: { type: 'integer', format: 'int32' },
      metadata: { type: 'object', nullable: true, additionalProperties: true },
      errorMessage: { type: 'string', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  NotificationResource: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      userId: { type: 'string', nullable: true },
      recipient: { type: 'string', nullable: true },
      channel: { type: 'string', enum: ['IN_APP', 'EMAIL', 'SMS'] },
      status: {
        type: 'string',
        enum: ['PENDING', 'SCHEDULED', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED'],
      },
      priority: {
        type: 'string',
        enum: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'],
      },
      eventKey: { type: 'string' },
      locale: { type: 'string' },
      subject: { type: 'string', nullable: true },
      data: { type: 'object', nullable: true, additionalProperties: true },
      metadata: { type: 'object', nullable: true, additionalProperties: true },
      errorMessage: { type: 'string', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      logs: {
        type: 'array',
        items: { $ref: '#/components/schemas/NotificationLogEntry' },
      },
    },
  },
  NotificationDispatchResult: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['fulfilled', 'rejected'],
      },
      notification: {
        $ref: '#/components/schemas/NotificationResource',
      },
      error: {
        type: 'object',
        nullable: true,
        properties: {
          message: { type: 'string' },
          code: { type: 'string' },
        },
      },
    },
  },
  UploadPresignRequest: {
    type: 'object',
    required: ['objectKey'],
    properties: {
      objectKey: {
        type: 'string',
        description: 'Path to the object within the MinIO bucket. Must not contain leading slashes or traversal segments.',
        example: 'editor/uploads/asset.png',
      },
      operation: {
        type: 'string',
        description: 'Determines whether a PUT (upload) or GET (download) URL is generated. Defaults to PUT.',
        enum: ['put', 'get'],
        example: 'put',
      },
      contentType: {
        type: 'string',
        nullable: true,
        description: 'MIME type enforced on upload requests. Only applicable for PUT operations.',
        example: 'image/png',
      },
      expiresIn: {
        type: 'integer',
        minimum: 1,
        description: 'Lifetime of the presigned URL in seconds. Falls back to server defaults when omitted.',
        example: 900,
      },
      responseHeaders: {
        type: 'object',
        additionalProperties: {
          type: 'string',
        },
        description: 'Optional response header overrides appended to GET presigned URLs.',
        example: {
          'response-content-disposition': 'inline',
        },
      },
    },
  },
  UploadPresignData: {
    type: 'object',
    required: ['url', 'method', 'objectKey', 'bucket', 'headers', 'expiresIn', 'expiresAt'],
    properties: {
      url: {
        type: 'string',
        format: 'uri',
        description: 'The signed URL that can be used for the requested operation.',
      },
      method: {
        type: 'string',
        enum: ['GET', 'PUT'],
        description: 'HTTP method to be used with the signed URL.',
      },
      objectKey: {
        type: 'string',
        description: 'Object key echoed back from the storage integration.',
      },
      bucket: {
        type: 'string',
        description: 'Bucket where the object is stored.',
      },
      headers: {
        type: 'object',
        additionalProperties: true,
        description: 'Headers that must be supplied when invoking the presigned URL.',
      },
      expiresIn: {
        type: 'integer',
        description: 'Number of seconds before the URL expires.',
      },
      expiresAt: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp at which the presigned URL becomes invalid.',
      },
      publicUrl: {
        type: 'string',
        format: 'uri',
        nullable: true,
        description: 'Publicly accessible CDN or proxy URL for the object when available.',
      },
    },
  },
  AuthUserProfile: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string', format: 'email' },
      firstName: { type: 'string', nullable: true },
      lastName: { type: 'string', nullable: true },
      dateOfBirth: { type: 'string', format: 'date', nullable: true },
      phoneNumber: { type: 'string', nullable: true },
      status: { type: 'string' },
      isEmailVerified: { type: 'boolean' },
      guardianConsent: { type: 'boolean' },
      roles: { type: 'array', items: { type: 'string' } },
      permissions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            resource: { type: 'string' },
            action: { type: 'string' },
          },
        },
      },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  AuthTokens: {
    type: 'object',
    properties: {
      accessToken: { type: 'string' },
      refreshToken: { type: 'string' },
      accessTokenExpiresIn: { type: 'integer' },
      refreshTokenExpiresIn: { type: 'integer' },
    },
  },
  AuthSessionMeta: {
    type: 'object',
    properties: {
      id: { type: 'string', nullable: true },
      expiresAt: { type: 'string', format: 'date-time', nullable: true },
      roles: { type: 'array', items: { type: 'string' } },
      permissions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            resource: { type: 'string' },
            action: { type: 'string' },
          },
        },
      },
    },
  },
  AuthRegistrationRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      dateOfBirth: { type: 'string', format: 'date', nullable: true },
      phoneNumber: { type: 'string', nullable: true },
      guardianEmail: { type: 'string', format: 'email', nullable: true },
      guardianName: { type: 'string', nullable: true },
    },
  },
  AuthRegistrationResponse: {
    allOf: [
      { $ref: '#/components/schemas/StandardSuccessResponse' },
      {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/AuthUserProfile' },
        },
      },
    ],
  },
  AuthLoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
  },
  AuthLoginResponse: {
    allOf: [
      { $ref: '#/components/schemas/StandardSuccessResponse' },
      {
        type: 'object',
        properties: {
          tokens: { $ref: '#/components/schemas/AuthTokens' },
          session: { $ref: '#/components/schemas/AuthSessionMeta' },
          user: { $ref: '#/components/schemas/AuthUserProfile' },
        },
      },
    ],
  },
  AuthRefreshResponse: {
    allOf: [
      { $ref: '#/components/schemas/StandardSuccessResponse' },
      {
        type: 'object',
        properties: {
          tokens: { $ref: '#/components/schemas/AuthTokens' },
          session: { $ref: '#/components/schemas/AuthSessionMeta' },
          user: { $ref: '#/components/schemas/AuthUserProfile' },
        },
      },
    ],
  },
  AuthVerificationResponse: {
    allOf: [
      { $ref: '#/components/schemas/StandardSuccessResponse' },
      {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/AuthUserProfile' },
        },
      },
    ],
  },
  AuthResetPasswordRequest: {
    type: 'object',
    required: ['token', 'password'],
    properties: {
      token: { type: 'string' },
      password: { type: 'string', minLength: 8 },
    },
  },
  AuthSessionResponse: {
    allOf: [
      { $ref: '#/components/schemas/StandardSuccessResponse' },
      {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/AuthUserProfile' },
          session: { $ref: '#/components/schemas/AuthSessionMeta' },
        },
      },
    ],
  },
  UploadPresignResponse: {
    type: 'object',
    required: ['status', 'data'],
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
      },
      data: {
        $ref: '#/components/schemas/UploadPresignData',
      },
    },
  },
};

export default schemas;
