import React, { useState } from 'react';
import { Form, Input, Button, message, Steps, Card } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import './PasswordReset.css';

const { Step } = Steps;

const PasswordReset = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  const requestReset = async () => {
    setLoading(true);
    try {
      await axios.post('/api/auth/request-password-reset', { email });
      message.success('Un email de réinitialisation a été envoyé');
      setCurrentStep(1);
    } catch (error) {
      message.error(error.response?.data?.message || 'Erreur lors de la demande');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (values) => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token') || values.token;
      
      await axios.post('/api/auth/reset-password', {
        token,
        newPassword: values.password
      });
      message.success('Mot de passe réinitialisé avec succès');
      setCurrentStep(0);
    } catch (error) {
      message.error(error.response?.data?.message || 'Erreur lors de la réinitialisation');
    }
  };

  return (
    <div className="password-reset-container">
      <Card title="Réinitialisation du mot de passe" className="reset-card">
        <Steps current={currentStep} className="reset-steps">
          <Step title="Email" description="Entrez votre adresse email" />
          <Step title="Nouveau mot de passe" description="Choisissez un nouveau mot de passe" />
        </Steps>

        {currentStep === 0 && (
          <div className="request-form">
            <Input
              prefix={<MailOutlined />}
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="large"
            />
            <Button 
              type="primary" 
              onClick={requestReset}
              loading={loading}
              size="large"
              block
            >
              Demander la réinitialisation
            </Button>
          </div>
        )}

        {currentStep === 1 && (
          <Form 
            onFinish={resetPassword} 
            className="reset-form"
            layout="vertical"
          >
            <Form.Item
              name="password"
              label="Nouveau mot de passe"
              rules={[
                { required: true, message: 'Ce champ est requis' },
                { min: 8, message: 'Minimum 8 caractères' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Entrez votre nouveau mot de passe" 
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="confirm"
              label="Confirmez le mot de passe"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Veuillez confirmer le mot de passe' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject('Les mots de passe ne correspondent pas');
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Confirmez votre mot de passe" 
                size="large"
              />
            </Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              size="large"
              block
            >
              Réinitialiser le mot de passe
            </Button>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default PasswordReset;