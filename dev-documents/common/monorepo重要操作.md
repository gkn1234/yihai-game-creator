<!--
 * @Descripttion: 
 * @version: 
 * @Author: Guo Kainan
 * @Date: 2021-05-24 16:47:02
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-08-26 18:33:08
-->
## 给某个包安装依赖
给 `package-b` 安装内部依赖 `package-a`

在项目根目录下执行
```
lerna add package-a --scope=package-b
```

给 `package-b` 安装npm包 `loadash`

在项目根目录下执行
```
lerna add loadash --scope=package-b
```

## 给所有包安装公共依赖
给所有包安装公共依赖 `loadash`

在项目根目录下执行
```
lerna add loadash
```

## 安装开发依赖
在项目根目录下执行
```
yarn add vite -W -D
```

## 批量执行命令
```
lerna run --stream --sort build
```
此处执行的命令为`build`，`--sort`支持按依赖项进行拓扑排序。


