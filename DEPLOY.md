# 部署到阿里云 ECS

本项目是一个 Next.js 16 应用，需要用 Node.js 常驻进程运行（不是纯静态网页），
外面套一层 Nginx 做反向代理和 HTTPS。

推荐组合：**阿里云 ECS + Node.js 22 + pnpm + PM2 + Nginx + HTTPS**。

---

## 0. 准备工作

在阿里云控制台先确认三件事：

1. **实例规格**：建议 2 核 4GB 起。`next build` 比较吃内存，2GB 的实例需要先加
   swap，否则构建可能被系统杀掉。
2. **安全组放行端口**：`22`（SSH）、`80`、`443`。
   **不要放行 `3000`**，Node 服务只在服务器内部监听。
3. **域名**：已解析到这台服务器的公网 IP。
   - PWA（离线缓存、添加到桌面）**必须走 HTTPS** 才能生效。
   - 如果用的是阿里云中国大陆节点，域名需要先完成 ICP 备案，否则 80/443 无法正常访问。

---

## 1. 在服务器上安装运行环境

通过 SSH 登录服务器后执行：

```bash
# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v

# pnpm（项目已锁定版本 11.21.0）
sudo corepack enable
corepack prepare pnpm@11.21.0 --activate
pnpm -v

# 进程守护与反向代理
sudo npm install -g pm2
sudo apt-get install -y nginx
```

如果服务器是 Alibaba Cloud Linux / CentOS，把 `apt-get` 换成 `dnf`，
Node 改用 NodeSource 的 rpm 源安装。

---

## 2. 上传代码

先在服务器上建好目录：

```bash
sudo mkdir -p /var/www/life-knowledge
sudo chown -R "$USER":"$USER" /var/www/life-knowledge
```

你在本机的项目目录是 `E:\LifeKnowledge`（目前还没有纳入 Git）。

### 方式 A：打包上传（推荐，能排除依赖目录）

在 Windows 本机执行：

```powershell
tar --exclude=node_modules --exclude=.next --exclude=tsconfig.tsbuildinfo -czf lk.tar.gz -C E:\LifeKnowledge .
scp E:\LifeKnowledge\lk.tar.gz root@<服务器公网IP>:/tmp/
```

然后在服务器上解压：

```bash
cd /var/www/life-knowledge
tar -xzf /tmp/lk.tar.gz
```

### 方式 B：图形化上传

用 WinSCP / FinalShell 把 `E:\LifeKnowledge` 里的文件传到
`/var/www/life-knowledge`，但**务必排除** `node_modules` 和 `.next`，
否则会传几万个文件，非常慢。

### 建议：先放进 Git

如果后续要频繁更新，把项目推到一个私有 Git 仓库（GitHub / 阿里云 Codeup），
服务器上直接 `git clone`，以后更新只要 `git pull`，比反复上传省事得多。

---

## 3. 构建并启动服务

```bash
cd /var/www/life-knowledge

# 安装依赖（严格按锁文件）
pnpm install --frozen-lockfile

# 生产构建
pnpm build

# 准备日志目录
sudo mkdir -p /var/log/life-knowledge
sudo chown -R "$USER":"$USER" /var/log/life-knowledge

# 用 PM2 启动（配置见项目根目录 ecosystem.config.cjs）
pm2 start ecosystem.config.cjs
pm2 save

# 设置开机自启：执行后它会打印一条 sudo 命令，照着再执行一次
pm2 startup
```

验证 Node 服务本身是否正常：

```bash
curl -I http://127.0.0.1:3000
# 期望看到 HTTP/1.1 200 OK

pm2 status
pm2 logs life-knowledge --lines 50
```

---

## 4. 配置 Nginx

```bash
sudo cp /var/www/life-knowledge/deploy/nginx-life-knowledge.conf \
        /etc/nginx/conf.d/life-knowledge.conf

# 把里面的 your-domain.com 全部替换成你的真实域名
sudo nano /etc/nginx/conf.d/life-knowledge.conf

sudo nginx -t          # 语法检查
sudo systemctl reload nginx
```

配置文件里已经处理好了本项目需要的几个点：

- Node 服务指向 `127.0.0.1:3000`
- 关闭响应缓冲，保留 Next.js 的流式渲染
- `client_max_body_size 20m`，够知识卡片批量导入用

---

## 5. 配置 HTTPS

### 方案 A：Let's Encrypt（免费，自动续期）

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 测试自动续期
sudo certbot renew --dry-run
```

certbot 会自己改写上面的 Nginx 配置并补上证书路径。

### 方案 B：阿里云 SSL 证书

在阿里云「数字证书管理服务」申请证书，下载 Nginx 版本，把 `.pem` 和 `.key`
分别放到：

```
/etc/nginx/ssl/your-domain.com.pem
/etc/nginx/ssl/your-domain.com.key
```

与配置文件中的路径保持一致，然后 `sudo systemctl reload nginx`。

---

## 6. 验收

```bash
curl -I https://your-domain.com
curl -I https://your-domain.com/random
```

再用手机浏览器打开 `https://your-domain.com`，确认：

- 随机页「换一张」「收藏」「已知道」都能点
- 上下滑动能换卡片
- 「我的」页各页签能切换

---

## 7. 日常更新流程

```bash
cd /var/www/life-knowledge

# 若已接入 Git
git pull

# 若是重新上传的压缩包，则先解压覆盖
# tar -xzf /tmp/lk.tar.gz

pnpm install --frozen-lockfile
pnpm build
pm2 reload life-knowledge
```

`pm2 reload` 会平滑重启，用户几乎无感知。

---

## 8. 针对本项目的注意事项

这些是部署前必须知道的事实，否则上线后容易踩坑：

1. **知识数据是内存态**。服务启动时只加载代码里的种子数据，重启后新增内容会丢失。
2. **后台导入接口**会把结果写到 `src/data/imported-cache.json`，但启动时**不会回读**这个文件。
   也就是说导入的内容只在当前进程生命周期内有效，重启即消失。
   要真正持久化，需要接数据库（当前版本还没有）。
3. **只能跑单实例**。因为数据在进程内存里，PM2 必须保持 `instances: 1` + `fork` 模式，
   不要改成 `cluster` 或多副本，否则各进程数据会不一致。
4. **用户数据在浏览器本地**。收藏、已掌握、待行动等状态存在访问者自己的 `localStorage`，
   换设备或清缓存就会丢，这是当前设计的已知限制。
5. **导入接口没有鉴权**，`/admin` 和 `/api/admin/import` 目前是公开的。
   正式对外前建议先用 Nginx 限制来源 IP：

   ```nginx
   location /admin {
       allow 你的办公网IP;
       deny all;
       proxy_pass http://life_knowledge;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
   }
   ```

   `/api/admin/import` 同理。
6. **`allowedDevOrigins` 只对开发模式生效**，生产部署不需要关心它。
7. **构建占资源**。如果 `pnpm build` 过程中进程被杀，先加 2GB swap：

   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

---

## 9. 常见问题排查

| 现象 | 排查方向 |
| --- | --- |
| 网站打不开 | `pm2 status`、`pm2 logs life-knowledge`、`sudo nginx -t` |
| 502 Bad Gateway | Node 进程没起来，或端口不是 3000，先 `curl 127.0.0.1:3000` |
| 按钮点了没反应 | 需要 HTTPS；同时按 F12 看控制台是否有脚本加载失败 |
| 样式或脚本错乱 | Nginx 是否误改了 `/_next/static/` 的响应头 |
| 构建被系统杀掉 | 内存不足，加 swap 或升级实例规格 |
| 域名访问被拦截 | 中国大陆节点需要先完成 ICP 备案 |

---

## 附：项目已经自带的部署文件

- `ecosystem.config.cjs` — PM2 进程配置
- `deploy/nginx-life-knowledge.conf` — Nginx 站点配置
- `DEPLOY.md` — 本文件
