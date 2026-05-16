---
title: 免费注册年抛 .bond 和 .cyou 域名教程
description: 详细教程：如何通过 Nicnames 和 Doma 免费注册顶级域名
published: 2026-05-13
categories: [技术教程]
tags: [免费域名,域名注册,bond域名,cyou域名,CloudFlare,Nicnames]
category: 域名
draft: false
---

# 免费注册年抛 .bond 和 .cyou 域名教程

## 前言

今天给大家分享一个免费域名的机会！Nicnames 联合 Doma 发放了免费域名，可以领取 **.bond** 和 **.cyou** 后缀的顶级域名（各两个）。

本次免费域名注册需要一点点"科技"，不过跟着教程一步步来就能搞定！

---

## 一、账号注册

### 1. 注册 Nicnames 账号

1. 进入 [Nicnames 官网](https://nicnames.com/en/signup) 注册账号
   - 使用邮箱注册即可（QQ 邮箱也可以）

### 2. 注册/加入 Discord

1. 有 Discord 账号的，点击下方链接接受 Doma 的邀请：
   
   [https://discord.com/invite/doma](https://discord.com/invite/doma)

2. 没有账号的，先在 [Discord 注册页面](https://discord.com/register) 创建账户
   - 电子邮件即可注册
   - **手机号码验证**：如果需要验证手机号但不想用真实号码，可以使用免费接码平台：
     - [Receive-SMS-Online 免费领 1.5€ 额度](https://receive-sms-online.info/promo.php?code=BONUS15)
     - 注册后有免费的1.5欧元接码额度
     - 选择一个虚拟号码接收 Discord 的验证短信
   - 点击创建账户后完成人机验证

3. 刚注册完等 **5 分钟**再进入 Discord 频道
4. 进入后点击一下 **验证**

### 3. 领取优惠券

1. 进入频道后，找到 **nicnames-promos** 频道
2. 点击 **【搜索 APP 和命令】** 按钮
3. 在搜索框中输入 `/promos`（或直接输入 `/` 就能看到 promos 命令）
4. 点击命令并按回车，nicnames bot 会和你对话
5. 如果没有绑定 nicnames 的邮箱，需要先绑定邮箱
6. 绑定完成后点击 **【Enter OTP Code】** 验证
7. 邮箱会收到验证码，如实填写即可
8. 验证完成后，如果没有其他信息，重新发送 `/promos` 命令
9. 在 **Select a promo to activate** 中点击 **【choose a promo to activate】**
10. 选择需要的域名抵扣券：
    - **bond 域名** × 1 张
    - **cyou 域名** × 1 张

11. 完成后机器人会回应，同时邮箱会收到抵扣券优惠码

---

## 二、域名注册

### 1. 搜索并添加域名

1. 回到 [Nicnames 网站域名页面](https://nicnames.com/en/domains)
2. 搜索自己喜欢的域名，例如：`yourname.bond`
3. 加入购物车

### 2. 填写联系人信息

1. 进入购物车后，填写 **Billing Address**
2. 点击 **【add new anonymous contact】** 匿名联系人
3. 联系人地址可以选择 **China**（方便随机填写）
4. 官方不会验证信息，但确保格式正确
5. 保存联系人信息

### 3. 应用优惠券

1. 点击 **【Enter Coupon Code】** 按钮
2. 填入邮箱收到的抵扣券编码
3. 点击 **【应用】**，价格会变成 **0**
4. 点击 **【continue】** 继续下一步
5. 完成注册！

### 4. 查看已注册域名

在 **domains → classic** 下就能看到注册的域名了。

> 提示：两张 bond/cyou 抵扣券只能注册新域名，不能续费。

---

## 三、域名托管到 CloudFlare

如果你想把域名托管到 CloudFlare（推荐），按以下步骤操作：

### 1. 添加站点到 CloudFlare

1. 登录 [CloudFlare 控制台](https://dash.cloudflare.com)
2. 点击右侧 **【添加站点】** 或 **【Add a Site】**
3. 输入刚刚注册的域名（如 `yourname.cyou`）
4. 点击 **【继续】**

### 2. 选择计划

选择 **Free（免费）** 计划

### 3. 配置 DNS 记录

1. CloudFlare 会让你添加 DNS 记录
2. 可以先不添加记录（或者删除默认记录）
3. 直接点击 **【继续前往激活】**

### 4. 激活并获取 NS 服务器

1. 激活完成后，CloudFlare 会为你分配 **NS 服务器地址**
   - 类似：`xxx.ns.cloudflare.com`
   - 记下这两个地址

### 5. 修改域名 DNS 服务器

1. 回到 Nicnames 的 **domains → classic**
2. 找到对应的域名，点击 **【设置】** 按钮
3. 在 **Name-Servers** 位置选择 **【Custom Name-Servers】**
4. 修改域名的 DNS 为 CloudFlare 分配的名称服务器地址（两个都要填）
5. 保存设置

### 6. 等待生效

- 通常需要 **几分钟到 24 小时** 生效
- 可以在 CloudFlare 查看状态

---

## 四、总结

| 项目 | 数量 | 有效期 | 可否托管 CF |
|------|------|--------|-------------|
| .bond 域名 | 2 个 | 年抛 | 是 |
| .cyou 域名 | 2 个 | 年抛 | 是 |

### 优势

- 完全免费
- 支持正规 TLD（非 TK/ML 之类）
- 可托管到 CloudFlare 使用 CDN
- 适合个人博客、项目展示

### 注意事项

- 需要科学上网访问部分网站
- 注册流程稍复杂（需要 Discord）
- 优惠券只能用于新注册，不能续费

---

## 参考链接

- [Nicnames 官网](https://nicnames.com)
- [Doma Discord 频道](https://discord.com/invite/doma)
- [CloudFlare 控制台](https://dash.cloudflare.com)

---

*本文教程基于网络资源整理，仅供学习参考。*
