import React from 'react';
import { Tabs } from 'antd';
import GitHubImport from './GitHubImport';
import PasswordReset from './PasswordReset';
import './AccountSettings.css';

const { TabPane } = Tabs;

const AccountSettings = () => {
  return (
    <div className="account-settings">
      <Tabs defaultActiveKey="1">
        <TabPane tab="Import GitHub" key="1">
          <GitHubImport />
        </TabPane>
        <TabPane tab="Sécurité" key="2">
          <PasswordReset />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AccountSettings;