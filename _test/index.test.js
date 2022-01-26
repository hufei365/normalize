const sum = (a, b) => a+b;

test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
});

const { normalize, schema, denormalize} = require("../dist/myschema.js");



// test cases from Jinyang.Li
const dataSet = {
    nestedOriginalData: {
        testId: '999',
        foo: 'foo',
        bar: {
            desc: 'bar',
            users: [{
                id: '3',
                name: 'JinyangLi'
            }]
        }
    },
    nestedNormalizedData: {
        result: '999',
        entities: {
            nested: {
                999: {
                    testId: '999',
                    foo: 'foo',
                    bar: {
                        desc: 'bar',
                        users: ['3']
                    }
                }
            },
            users: {
                3: { id: '3', name: 'JinyangLi' }
            }
        }
    },
    emptyOriginalData: {
        id: '10086'
    },
    emptyNormalizedData: {
        result: '10086',
        entities: {
            empty: {
                10086: { id: '10086' }
            }
        }
    },
    userOriginalData: {
        id: '1',
        name: 'Paul'
    },
    commentOriginalData: {
        id: '324',
        commenter: {
            id: '2',
            name: 'Nicole'
        }
    },
    articleOriginalData: {
        id: '123',
        author: { id: '1', name: 'Paul' },
        title: 'My awesome blog post',
        comments: [{
            id: '324',
            commenter: {
                id: '2',
                name: 'Nicole'
            }
        }]
    },
    customizedOriginalData: {
        id: '321',
        author: {
            id: '3',
            name: 'JinyangLi'
        },
        title: 'Jest',
        comments: [
            {
                id: '325',
                commenter: {
                    id: '3',
                    name: 'JinyangLi'
                }
            },
            {
                id: '326',
                commenter: {
                    id: '2',
                    name: 'Nicole'
                }
            }
        ]
    },
    userNormalizedData: {
        result: '1',
        entities: {
            users: {
                1: { id: '1', name: 'Paul' }
            }
        }
    },
    commentNormalizedData: {
        result: '324',
        entities: {
            comments: {
                324: {
                    id: '324',
                    commenter: '2'
                }
            },
            users: {
                2: {
                    id: '2',
                    name: 'Nicole'
                }
            }
        }
    },
    articleNormalizedData: {
        result: '123',
        entities: {
            articles: {
                123: {
                    id: '123',
                    author: '1',
                    title: 'My awesome blog post',
                    comments: ['324']
                }
            },
            users: {
                1: { id: '1', name: 'Paul' },
                2: { id: '2', name: 'Nicole' }
            },
            comments: {
                324: { id: '324', commenter: '2' }
            }
        }
    },
    customizedNormalizedData: {
        result: '321',
        entities: {
            articles: {
                321: {
                    id: '321',
                    author: '3',
                    title: 'Jest',
                    comments: ['325', '326']
                }
            },
            users: {
                2: { id: '2', name: 'Nicole' },
                3: { id: '3', name: 'JinyangLi' }
            },
            comments: {
                325: { id: '325', commenter: '3' },
                326: { id: '326', commenter: '2' }
            }
        }
    }
}

Object.assign(dataSet, {
    arrayOriginalData: [dataSet.articleOriginalData, dataSet.customizedOriginalData],
    arrayNormalizedData: {
        result: ['123', '321'],
        entities: {
            articles: Object.assign(
                {},
                dataSet.articleNormalizedData.entities.articles,
                dataSet.customizedNormalizedData.entities.articles
            ),
            users: Object.assign(
                {},
                dataSet.articleNormalizedData.entities.users,
                dataSet.customizedNormalizedData.entities.users
            ),
            comments: Object.assign(
                {},
                dataSet.articleNormalizedData.entities.comments,
                dataSet.customizedNormalizedData.entities.comments
            )
        }
    }
})

// Define a users schema
const user = new schema.Entity('users')

// Define your comments schema
const comment = new schema.Entity('comments', {
    commenter: user
})

// Define your article
const article = new schema.Entity('articles', {
    author: user,
    comments: [comment]
})

const nested = new schema.Entity('nested', {
    bar: {
        users: [user]
    }
}, {
    idAttribute: 'testId'
})

const empty = new schema.Entity('empty', {})

const types = [
    'empty',
    'user',
    'comment',
    'article',
    'customized',
    'array',
    'nested'
]

const schemas = [
    empty,
    user,
    comment,
    article,
    article,
    [article],
    nested
]

types.forEach((type, idx) => {
    describe(type, () => {
        const originalData = dataSet[`${type}OriginalData`]
        const normalizedData = dataSet[`${type}NormalizedData`]
        const entity = schemas[idx]
        const { result, entities } = normalizedData

        const org2Nor = normalize(originalData, entity)

        test(`${type} normalize`, () => {
            expect(org2Nor).toEqual(normalizedData)
        })
        const nor2Org = denormalize(result, entity, entities)

        test(`${type} denormalize`, () => {
            expect(nor2Org).toEqual(originalData)
        })
    })
})

// test cases from steins
describe('schema', () => {
    test('可以自定义idAttribute', () => {
        const e = new Entity('users', {}, {
            idAttribute: 'uid'
        })
        expect(normalize({ uid: 1, name: 'steins' }, e)).toEqual({
            result: 1,
            entities: {
                users: {
                    1: {
                        uid: 1,
                        name: 'steins'
                    }
                }
            }
        })
    })
})

describe('normalize', () => {
    test('能正常使用 normalize', () => {
        const user = new Entity('users')
        const data = {
            id: 1,
            name: 'steins',
            job: 'FE'
        }
        const normalizeData = normalize(data, user)
        expect(normalizeData).toEqual({
            result: 1,
            entities: {
                users: {
                    1: {
                        id: 1,
                        name: 'steins',
                        job: 'FE'
                    }
                }
            }
        })
    })

    test('可使用嵌套数据结构', () => {
        const originalData = {
            id: '123',
            author: {
                id: '1',
                name: 'Paul'
            },
            title: 'My awesome blog post',
            comments: [
                {
                    id: '324',
                    commenter: {
                        id: '2',
                        name: 'Nicole'
                    }
                }
            ]
        }
        const user = new schema.Entity('users')

        const comment = new schema.Entity('comments', {
            commenter: user
        })

        const article = new schema.Entity('articles', {
            author: user,
            comments: [comment]
        })

        expect(normalize(originalData, article)).toEqual({
            result: '123',
            entities: {
                articles: {
                    123: {
                        id: '123',
                        author: '1',
                        title: 'My awesome blog post',
                        comments: ['324']
                    }
                },
                users: {
                    1: { id: '1', name: 'Paul' },
                    2: { id: '2', name: 'Nicole' }
                },
                comments: {
                    324: { id: '324', commenter: '2' }
                }
            }
        })
    })

    test('可使用嵌套数据结构，数组', () => {
        const originalData = [{
            id: '123',
            author: {
                uid: '1',
                name: 'Paul'
            },
            title: 'My awesome blog post',
            comments: {
                total: 100,
                result: [{
                    id: '324',
                    commenter: {
                        uid: '2',
                        name: 'Nicole'
                    }
                }]
            }
        }]

        const user = new schema.Entity('users', {}, {
            idAttribute: 'uid'
        })

        const comment = new schema.Entity('comments', {
            commenter: user
        })

        const article = new schema.Entity('articles', {
            author: user,
            comments: {
                result: [comment]
            }
        })

        expect(normalize(originalData, [article])).toEqual({
            result: ['123'],
            entities: {
                articles: {
                    123: {
                        id: '123',
                        author: '1',
                        title: 'My awesome blog post',
                        comments: {
                            total: 100,
                            result: ['324']
                        }
                    }
                },
                users: {
                    1: { uid: '1', name: 'Paul' },
                    2: { uid: '2', name: 'Nicole' }
                },
                comments: {
                    324: { id: '324', commenter: '2' }
                }
            }
        })
    })

    test('可使用多层嵌套数据结构', () => {
        const user = new schema.Entity('users')
        const comment = new schema.Entity('comments', {
            user: user,
            star: [user]
        })
        const article = new schema.Entity('articles', {
            author: user,
            comments: [comment]
        })

        const input = {
            id: '123',
            title: 'A Great Article',
            author: {
                id: '8472',
                name: 'Paul'
            },
            body: 'This article is great.',
            comments: [
                {
                    id: 'comment-123-4738',
                    comment: 'I like it!',
                    user: {
                        id: '10293',
                        name: 'Jane'
                    },
                    star: [{
                        id: '10293',
                        name: 'Jane'
                    }, {
                        id: '10294',
                        name: 'steins'
                    }]
                }
            ]
        }
        expect(normalize(input, article)).toEqual({
            result: '123',
            entities: {
                articles: {
                    123: {
                        id: '123',
                        title: 'A Great Article',
                        author: '8472',
                        body: 'This article is great.',
                        comments: ['comment-123-4738']
                    }
                },
                users: {
                    8472: {
                        id: '8472',
                        name: 'Paul'
                    },
                    10293: {
                        id: '10293',
                        name: 'Jane'
                    },
                    10294: {
                        id: '10294',
                        name: 'steins'
                    }
                },
                comments: {
                    'comment-123-4738': {
                        id: 'comment-123-4738',
                        comment: 'I like it!',
                        user: '10293',
                        star: ['10293', '10294']
                    }
                }
            }
        })
    })
})

describe('denormalize', () => {
    test('能正常使用 denormalize', () => {
        const user = new Entity('users')
        const data = {
            result: 1,
            entities: {
                users: {
                    1: {
                        id: 1,
                        name: 'steins',
                        job: 'FE'
                    }
                }
            }
        }
        expect(denormalize(data.result, user, data.entities)).toEqual({
            id: 1,
            name: 'steins',
            job: 'FE'
        })
    })

    test('可使用嵌套数据结构', () => {
        const data = {
            result: '123',
            entities: {
                articles: {
                    123: {
                        id: '123',
                        author: '1',
                        title: 'My awesome blog post',
                        comments: ['324']
                    }
                },
                users: {
                    1: { id: '1', name: 'Paul' },
                    2: { id: '2', name: 'Nicole' }
                },
                comments: {
                    324: { id: '324', commenter: '2' }
                }
            }
        }
        const user = new schema.Entity('users')

        const comment = new schema.Entity('comments', {
            commenter: user
        })

        const article = new schema.Entity('articles', {
            author: user,
            comments: [comment]
        })

        expect(denormalize(data.result, article, data.entities)).toEqual({
            id: '123',
            author: {
                id: '1',
                name: 'Paul'
            },
            title: 'My awesome blog post',
            comments: [
                {
                    id: '324',
                    commenter: {
                        id: '2',
                        name: 'Nicole'
                    }
                }
            ]
        })
    })

    test('可使用嵌套数据结构，数组', () => {
        const data = {
            result: '123',
            entities: {
                articles: {
                    123: {
                        id: '123',
                        author: '1',
                        title: 'My awesome blog post',
                        comments: {
                            total: 100,
                            result: ['324']
                        }
                    }
                },
                users: {
                    1: { uid: '1', name: 'Paul' },
                    2: { uid: '2', name: 'Nicole' }
                },
                comments: {
                    324: { id: '324', commenter: '2' }
                }
            }
        }
        const user = new schema.Entity('users', {}, {
            idAttribute: 'uid'
        })

        const comment = new schema.Entity('comments', {
            commenter: user
        })

        const article = new schema.Entity('articles', {
            author: user,
            comments: {
                result: [comment]
            }
        })

        expect(denormalize(data.result, article, data.entities)).toEqual({
            id: '123',
            author: {
                uid: '1',
                name: 'Paul'
            },
            title: 'My awesome blog post',
            comments: {
                total: 100,
                result: [{
                    id: '324',
                    commenter: {
                        uid: '2',
                        name: 'Nicole'
                    }
                }]
            }
        })
    })

    test('可使用多层嵌套数据结构', () => {
        const user = new schema.Entity('users')
        const comment = new schema.Entity('comments', {
            user: user,
            star: [user]
        })
        const article = new schema.Entity('articles', {
            author: user,
            comments: [comment]
        })

        const data = {
            result: '123',
            entities: {
                articles: {
                    123: {
                        id: '123',
                        title: 'A Great Article',
                        author: '8472',
                        body: 'This article is great.',
                        comments: ['comment-123-4738']
                    }
                },
                users: {
                    8472: {
                        id: '8472',
                        name: 'Paul'
                    },
                    10293: {
                        id: '10293',
                        name: 'Jane'
                    },
                    10294: {
                        id: '10294',
                        name: 'steins'
                    }
                },
                comments: {
                    'comment-123-4738': {
                        id: 'comment-123-4738',
                        comment: 'I like it!',
                        user: '10293',
                        star: ['10293', '10294']
                    }
                }
            }
        }

        expect(denormalize(data.result, article, data.entities)).toEqual({
            id: '123',
            title: 'A Great Article',
            author: {
                id: '8472',
                name: 'Paul'
            },
            body: 'This article is great.',
            comments: [
                {
                    id: 'comment-123-4738',
                    comment: 'I like it!',
                    user: {
                        id: '10293',
                        name: 'Jane'
                    },
                    star: [{
                        id: '10293',
                        name: 'Jane'
                    }, {
                        id: '10294',
                        name: 'steins'
                    }]
                }
            ]
        })
    })
});