import {
  ComponentsObject,
  ExternalDocumentationObject,
  InfoObject,
  OpenAPIObject,
  SecurityRequirementObject,
  SecuritySchemeObject,
  ServerObject,
  ServerVariableObject,
  TagObject,
} from "./interfaces/swagger";
import { isUndefined, negate, pickBy } from "lodash";

export class NailySwaggerDocumentBuilder {
  private info: InfoObject;
  private servers: ServerObject[];
  private security: SecurityRequirementObject[];
  private components: ComponentsObject;
  private externalDocs: ExternalDocumentationObject;
  private tags: TagObject[];
  private extensions: Record<string, any>;

  /**
   * ### Naily Swagger Document Builder
   *
   * Set the title of the Swagger document
   *
   * @param {string} title - The title of the Swagger document
   * @see https://swagger.io/specification/#infoObject
   * @return {Omit<this, "setTitle">}
   * @memberof NailySwaggerDocumentBuilder
   */
  public setTitle(title: string): Omit<this, "setTitle"> {
    if (!this.info) this.info = { title } as InfoObject;
    this.info.title = title;
    return this;
  }

  /**
   * ### Naily Swagger Document Builder
   *
   * Set the description of the Swagger document
   *
   * @param {string} description - The description of the Swagger document
   * @see https://swagger.io/specification/#infoObject
   * @return {Omit<this, "setDescription">}
   * @memberof NailySwaggerDocumentBuilder
   */
  public setDescription(description: string): Omit<this, "setDescription"> {
    if (!this.info) this.info = { description } as InfoObject;
    this.info.description = description;
    return this;
  }

  /**
   * ### Naily Swagger Document Builder
   *
   * Set the version of the Swagger document
   *
   * @param {string} version - The version of the Swagger document
   * @see https://swagger.io/specification/#infoObject
   * @return {Omit<this, "setVersion">}
   * @memberof NailySwaggerDocumentBuilder
   */
  public setVersion(version: string): Omit<this, "setVersion"> {
    if (!this.info) this.info = { version } as InfoObject;
    this.info.version = version;
    return this;
  }

  /**
   * ### Naily Swagger Document Builder
   *
   * Set the terms of service of the Swagger document
   *
   * @param {string} termsOfService - The terms of service of the Swagger document
   * @see https://swagger.io/specification/#infoObject
   * @return {Omit<this, "setTermsOfService">}
   * @memberof NailySwaggerDocumentBuilder
   */
  public setTermsOfService(termsOfService: string): Omit<this, "setTermsOfService"> {
    if (!this.info) this.info = { termsOfService } as InfoObject;
    this.info.termsOfService = termsOfService;
    return this;
  }

  /**
   * ### Naily Swagger Document Builder
   *
   * Set the contact of the Swagger document
   *
   * @param {string} name
   * @param {string} [url]
   * @param {string} [email]
   * @see https://swagger.io/specification/#contactObject
   * @return {Omit<this, "setContact">}
   * @memberof NailySwaggerDocumentBuilder
   */
  public setContact(name: string, url?: string, email?: string): Omit<this, "setContact"> {
    if (!this.info) this.info = {} as InfoObject;
    this.info.contact = { name, url, email };
    return this;
  }

  /**
   * ### Naily Swagger Document Builder
   *
   * Set the license of the Swagger document
   *
   * @param {string} name
   * @param {string} [url]
   * @see https://swagger.io/specification/#licenseObject
   * @return {Omit<this, "setLicense">}
   * @memberof NailySwaggerDocumentBuilder
   */
  public setLicense(name: string, url?: string): Omit<this, "setLicense"> {
    if (!this.info) this.info = {} as InfoObject;
    this.info.license = { name, url };
    return this;
  }

  /**
   * ### Naily Swagger Document Builder
   *
   * Set the paths of the Swagger document
   *
   * @param {string} description
   * @param {string} url
   * @see https://swagger.io/specification/#externalDocumentationObject
   * @return {Omit<this, "setExternalDoc">}
   * @memberof NailySwaggerDocumentBuilder
   */
  public setExternalDoc(description: string, url: string): Omit<this, "setExternalDoc"> {
    if (!this.info) this.info = {} as InfoObject;
    this.externalDocs = { description, url };
    return this;
  }

  /**
   * ### Naily Swagger Document Builder
   *
   * Add a server object item to swagger document
   *
   * @param {string} url - The URL of the server
   * @param {string} [description] - An optional string describing the host designated by the URL
   * @param {Record<string, ServerVariableObject>} [variables] - A map between a variable name and its value
   * @see https://swagger.io/specification/#serverObject
   * @return {this}
   * @memberof NailySwaggerDocumentBuilder
   */
  public addServer(url: string, description?: string, variables?: Record<string, ServerVariableObject>): this {
    if (!this.servers) this.servers = [];
    this.servers.push({
      description,
      url,
      variables,
    });
    return this;
  }

  /**
   * ### Naily Swagger Document Builder
   *
   * Add a tag object item to swagger document
   *
   * @param {string} name - The name of the tag
   * @param {string} [description=""] - An optional string describing the tag
   * @param {ExternalDocumentationObject} [externalDocs] - An optional external documentation for this tag
   * @see https://swagger.io/specification/#tagObject
   * @return {this}
   * @memberof NailySwaggerDocumentBuilder
   */
  public addTag(name: string, description: string = "", externalDocs?: ExternalDocumentationObject): this {
    this.tags = this.tags.concat(
      pickBy(
        {
          name,
          description,
          externalDocs,
        },
        negate(isUndefined),
      ) as TagObject,
    );
    return this;
  }

  /**
   * ### Naily Swagger Document Builder
   *
   * Add a extend property to swagger document
   *
   * @template T
   * @param {string} name - The name of the property
   * @param {T} value - The value of the property
   * @return {this}
   * @memberof NailySwaggerDocumentBuilder
   */
  public addExtension<T>(name: string, value: T): this {
    if (!this.extensions) this.extensions = {};
    this.extensions[name] = value;
    return this;
  }

  /**
   * ### Naily Swagger Document Builder
   *
   * Add a security requirement object item to swagger document
   *
   * @param {string} name - The name of the security
   * @param {SecuritySchemeObject} options - The options of the security
   * @see https://swagger.io/specification/#securityRequirementObject
   * @return {this}
   * @memberof NailySwaggerDocumentBuilder
   */
  public addSecurity(name: string, options: SecuritySchemeObject): this {
    if (!this.components) this.components = {};
    if (!this.components.securitySchemes) this.components.securitySchemes = {};
    this.components.securitySchemes[name] = options;
    return this;
  }

  /**
   * ### Naily Swagger Document Builder
   *
   * Add bearer auth to swagger document
   *
   * @author Zero <gczgroup@qq.com>
   * @date 2024/03/01
   * @param {SecuritySchemeObject} [options={type: "http"}] - The options of the security
   * @param {string} [name="bearer"] - The name of the security
   * @see https://swagger.io/specification/#securityRequirementObject
   * @return {this}
   * @memberof NailySwaggerDocumentBuilder
   */
  public addBearerAuth(
    options: SecuritySchemeObject = {
      type: "http",
    },
    name: string = "bearer",
  ): this {
    this.addSecurity(name, {
      scheme: "bearer",
      bearerFormat: "JWT",
      ...options,
    });
    return this;
  }

  /**
   * ### Naily Swagger Document Builder
   *
   * Add oauth2 to swagger document
   *
   * @param {SecuritySchemeObject} [options={type: "oauth2"}] - The options of the security
   * @param {string} [name="oauth2"] - The name of the security
   * @see https://swagger.io/specification/#securityRequirementObject
   * @return {this}
   * @memberof NailySwaggerDocumentBuilder
   */
  public addOAuth2(
    options: SecuritySchemeObject = {
      type: "oauth2",
    },
    name: string = "oauth2",
  ): this {
    this.addSecurity(name, {
      type: "oauth2",
      flows: {},
      ...options,
    });
    return this;
  }

  /**
   * ### Naily Swagger Document Builder
   *
   * Add api key to swagger document
   *
   * @param {SecuritySchemeObject} [options={type: "apiKey"}] - The options of the security
   * @param {string} [name="api_key"] - The name of the security
   * @see https://swagger.io/specification/#securityRequirementObject
   * @return {this}
   * @memberof NailySwaggerDocumentBuilder
   */
  public addApiKey(
    options: SecuritySchemeObject = {
      type: "apiKey",
    },
    name: string = "api_key",
  ): this {
    this.addSecurity(name, {
      type: "apiKey",
      in: "header",
      name,
      ...options,
    });
    return this;
  }

  /**
   * ### Naily Swagger Document Builder
   *
   * Add basic auth to swagger document
   *
   * @author Zero <gczgroup@qq.com>
   * @date 2024/03/01
   * @param {SecuritySchemeObject} [options={type: "http"}] - The options of the security
   * @param {string} [name="basic"] - The name of the security
   * @see https://swagger.io/specification/#securityRequirementObject
   * @return {this}
   * @memberof NailySwaggerDocumentBuilder
   */
  public addBasicAuth(
    options: SecuritySchemeObject = {
      type: "http",
    },
    name: string = "basic",
  ): this {
    this.addSecurity(name, {
      type: "http",
      scheme: "basic",
      ...options,
    });
    return this;
  }

  /**
   * ### Naily Swagger Document Builder
   *
   * Add cookie auth to swagger document
   *
   * @param {string} [cookieName="connect.sid"] - The name of the cookie
   * @param {SecuritySchemeObject} [options={type: "apiKey"}] - The options of the security
   * @param {string} [securityName="cookie"] - The name of the security
   * @see https://swagger.io/specification/#securityRequirementObject
   * @return {this}
   * @memberof NailySwaggerDocumentBuilder
   */
  public addCookieAuth(
    cookieName: string = "connect.sid",
    options: SecuritySchemeObject = {
      type: "apiKey",
    },
    securityName: string = "cookie",
  ): this {
    this.addSecurity(securityName, {
      type: "apiKey",
      in: "cookie",
      name: cookieName,
      ...options,
    });
    return this;
  }

  /**
   * ### Naily Swagger Document Builder
   *
   * Final Build the swagger document
   *
   * @return {OpenAPIObject}
   * @memberof NailySwaggerDocumentBuilder
   */
  public build(): Omit<OpenAPIObject, "paths"> {
    return {
      openapi: "3.0.0",
      info: this.info,
      servers: this.servers,
      security: this.security,
      components: this.components,
      externalDocs: this.externalDocs,
      tags: this.tags,
      ...this.extensions,
    };
  }
}
