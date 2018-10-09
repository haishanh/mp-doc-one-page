'use strict';

const DocBaseUrl = 'https://developers.weixin.qq.com';
const DevDocBaseUrl = 'https://developers.weixin.qq.com/miniprogram/dev';

const groups = [
  {
    id: 'dev',
    title: '开发',
    sections: [
      {
        id: 'framework',
        title: '框架',
        fetchURL: DevDocBaseUrl + '/framework/MINA.html'
      },
      {
        id: 'api',
        title: 'API',
        fetchURL: DevDocBaseUrl + '/api/'
      },
      {
        id: 'component',
        title: '组件',
        fetchURL: DevDocBaseUrl + '/component/'
      },
      {
        id: 'quickstart',
        title: '简易教程',
        fetchURL: DevDocBaseUrl + '/'
      },
      {
        id: 'tools',
        title: '工具',
        fetchURL: DevDocBaseUrl + '/devtools/devtools.html'
      },
      {
        id: 'wxcloud',
        title: '云开发',
        fetchURL: DevDocBaseUrl + '/wxcloud/basis/getting-started.html'
      }
    ]
  },
  {
    title: '设计',
    id: 'design',
    sections: [
      {
        id: 'guide',
        title: '设计指南',
        fetchURL: DocBaseUrl + '/miniprogram/design/'
      }
    ]
  },
  {
    title: '介绍',
    id: 'introduction',
    sections: [
      {
        id: 'guide',
        title: '开发指南',
        fetchURL: DocBaseUrl + '/miniprogram/introduction/'
      },
      {
        id: 'customerservice',
        title: '客服功能使用指南',
        fetchURL: DocBaseUrl + '/miniprogram/introduction/custom.html'
      },
      {
        id: 'qrcode',
        title: '扫码打开小程序接入指南',
        fetchURL: DocBaseUrl + '/miniprogram/introduction/qrcode.html'
      },
      {
        id: 'plugin',
        title: '插件接入指南',
        fetchURL: DocBaseUrl + '/miniprogram/introduction/plugin.html'
      }
    ]
  },
  {
    title: '数据',
    id: 'analysis',
    sections: [
      {
        id: 'intro',
        title: '功能概述',
        fetchURL: DocBaseUrl + '/miniprogram/analysis/'
      },
      {
        id: 'regular',
        title: '常规分析',
        fetchURL: DocBaseUrl + '/miniprogram/analysis/regular/'
      },
      {
        id: 'custom',
        title: '自定义分析',
        fetchURL: DocBaseUrl + '/miniprogram/analysis/custom/'
      },
      {
        id: 'assistant',
        title: '小程序数据助手',
        fetchURL: DocBaseUrl + '/miniprogram/analysis/assistant/'
      }
    ]
  },
  {
    title: '运营',
    id: 'product',
    sections: [
      {
        id: 'intro',
        title: '运营规范',
        fetchURL: DocBaseUrl + '/miniprogram/product/'
      },
      {
        id: 'reject',
        title: '常见拒绝情形',
        fetchURL: DocBaseUrl + '/miniprogram/product/reject.html'
      },
      {
        id: 'service',
        title: '服务条款',
        fetchURL: DocBaseUrl + '/miniprogram/product/service.html'
      },
      {
        id: 'renzheng',
        title: '微信认证指引',
        fetchURL: DocBaseUrl + '/miniprogram/product/renzheng.html'
      },
      {
        id: 'material',
        title: '开放的服务类目',
        fetchURL: DocBaseUrl + '/miniprogram/product/material.html'
      }
    ]
  }
];

module.exports = { groups };
