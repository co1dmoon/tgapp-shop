/**
 * Клиент для работы с AmoCRM API
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class AmoCRMClient {
  constructor(clientId, clientSecret, redirectUri) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.baseUrl = '';
    this.accessToken = process.env.AMO_ACCESS_TOKEN || '';
    this.refreshToken = process.env.AMO_REFRESH_TOKEN || '';
    this.tokensFile = path.join(__dirname, '../.amocrm_tokens.json');

    this.loadTokens();
  }

  loadTokens() {
    try {
      if (fs.existsSync(this.tokensFile)) {
        const tokens = JSON.parse(fs.readFileSync(this.tokensFile, 'utf8'));
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
      }
    } catch (error) {
      console.error('Ошибка при загрузке токенов AmoCRM:', error);
    }
  }

  saveTokens() {
    try {
      fs.writeFileSync(
        this.tokensFile,
        JSON.stringify({
          accessToken: this.accessToken,
          refreshToken: this.refreshToken,
        }),
        'utf8'
      );
    } catch (error) {
      console.error('Ошибка при сохранении токенов AmoCRM:', error);
    }
  }

  async getAccessToken(code) {
    try {
      const response = await axios.post(`${this.baseUrl}/oauth2/access_token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
      });

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      this.saveTokens();

      return {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
      };
    } catch (error) {
      console.error(
        'Ошибка при получении токена доступа:',
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async refreshAccessToken() {
    try {
      const response = await axios.post(`${this.baseUrl}/oauth2/access_token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        redirect_uri: this.redirectUri,
      });

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      this.saveTokens();

      return {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
      };
    } catch (error) {
      console.error(
        'Ошибка при обновлении токена доступа:',
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async request(method, url, data = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      };

      const response = await axios({
        method,
        url: `${this.baseUrl}/api/v4/${url}`,
        headers,
        data,
      });

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Токен истек, попытка обновить
        await this.refreshAccessToken();
        // Повторный запрос с новым токеном
        return this.request(method, url, data);
      }

      console.error(
        `Ошибка при запросе к AmoCRM API (${url}):`,
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async createContact(contact) {
    try {
      const data = [
        {
          name: contact.name,
          custom_fields_values: [
            {
              field_id: parseInt(process.env.AMO_PHONE_FIELD_ID),
              values: [{ value: contact.phone }],
            },
          ],
        },
      ];

      // Добавляем email, если он указан
      if (contact.email) {
        data[0].custom_fields_values.push({
          field_id: parseInt(process.env.AMO_EMAIL_FIELD_ID),
          values: [{ value: contact.email }],
        });
      }

      const response = await this.request('POST', 'contacts', data);
      return response._embedded.contacts[0];
    } catch (error) {
      console.error('Ошибка при создании контакта в AmoCRM:', error);
      throw error;
    }
  }

  async createDeal(deal) {
    try {
      const data = [
        {
          name: deal.name,
          price: deal.price,
          pipeline_id: parseInt(process.env.AMO_PIPELINE_ID),
          status_id: parseInt(process.env.AMO_NEW_STATUS_ID),
        },
      ];

      const response = await this.request('POST', 'leads', data);
      return response._embedded.leads[0];
    } catch (error) {
      console.error('Ошибка при создании сделки в AmoCRM:', error);
      throw error;
    }
  }

  async linkContactToDeal(contactId, dealId) {
    try {
      const data = [
        {
          to_entity_id: contactId,
          to_entity_type: 'contacts',
        },
      ];

      await this.request('POST', `leads/${dealId}/link`, data);
      return true;
    } catch (error) {
      console.error(
        'Ошибка при связывании контакта со сделкой в AmoCRM:',
        error
      );
      throw error;
    }
  }

  async addProductToDeal(dealId, product) {
    try {
      const data = [
        {
          product_id: 0, // 0 для создания товара без каталога
          name: product.name,
          quantity: product.quantity,
          unit_price: product.price,
          unit_type: 'шт',
        },
      ];

      await this.request('POST', `leads/${dealId}/products`, data);
      return true;
    } catch (error) {
      console.error('Ошибка при добавлении товара в сделку в AmoCRM:', error);
      throw error;
    }
  }

  // Обновление статуса сделки
  async updateDealStatus(dealId, statusId, pipelineId = null) {
    const data = {
      status_id: parseInt(statusId),
    };

    if (pipelineId) {
      data.pipeline_id = parseInt(pipelineId);
    }

    await this.request('PATCH', `leads/${dealId}`, [data]);
    return true;
  }

  // Получение списка сделок
  async getDeals(filter = {}) {
    let endpoint = 'leads';
    const queryParams = [];

    // Добавление фильтров
    if (filter.status_id) {
      queryParams.push(`filter[status_id]=${filter.status_id}`);
    }

    if (filter.pipeline_id) {
      queryParams.push(`filter[pipeline_id]=${filter.pipeline_id}`);
    }

    if (queryParams.length > 0) {
      endpoint += '?' + queryParams.join('&');
    }

    const response = await this.request('GET', endpoint);
    return response._embedded.leads;
  }
}

module.exports = AmoCRMClient;
