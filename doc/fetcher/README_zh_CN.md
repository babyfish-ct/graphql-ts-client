# Fetcher

Fetcher是本框架的核心概念。对于GraphQL中的每一个ObjectType，都会生成一个Fetcher，包含Query和Muation

假如代码生成器中配置目标目录为"src/__generated"，那么所有的fetcher都位于"src/__generated/fetchers"

本框架有三种使用方式
1. 独立使用
2. 和@apollo/client配合使用
3. 和relay配合使用

为了简化本问题，除了的少数章节外，都是用独立使用的方式讲解。

1. [基本使用](./basic_zh_CN.md)
2. [默认Fetcher](./default-fetcher_zh_CN.md)
3. [参数](./variables_zh_CN.md)
4. [碎片](./fragment_zh_CN.md)
5. [别名](./alias_zh_CN.md)
6. [指令](./directive_zh_CN.md)

----------------------
[返回上级](../README_zh_CN.md) | [<上一篇: 代码生成器](../generator_zh_CN.md) | [下一篇: 和@apollo/client一起使用>](../apollo_zh_CN.md)