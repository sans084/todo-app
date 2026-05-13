import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::todo.todo', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    // Use strapi.db.query which works reliably in Strapi v5
    const todos = await strapi.db.query('api::todo.todo').findMany({
      where: { users_permissions_user: { id: user.id } },
      orderBy: { createdAt: 'desc' },
    });

    return { data: todos, meta: { pagination: { total: todos.length } } };
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { title, isCompleted } = (ctx.request.body as any).data || {};

    const todo = await strapi.db.query('api::todo.todo').create({
      data: {
        title,
        isCompleted: isCompleted ?? false,
        users_permissions_user: user.id,
        publishedAt: new Date(),
      },
    });

    return { data: todo };
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const existing = await strapi.db.query('api::todo.todo').findOne({
      where: { id: ctx.params.id },
      populate: ['users_permissions_user'],
    });

    if (!existing) return ctx.notFound('Todo not found.');
    if ((existing as any).users_permissions_user?.id !== user.id) return ctx.forbidden('Forbidden.');

    const { isCompleted, title } = (ctx.request.body as any).data || {};

    const todo = await strapi.db.query('api::todo.todo').update({
      where: { id: ctx.params.id },
      data: { ...(title !== undefined && { title }), ...(isCompleted !== undefined && { isCompleted }) },
    });

    return { data: todo };
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const existing = await strapi.db.query('api::todo.todo').findOne({
      where: { id: ctx.params.id },
      populate: ['users_permissions_user'],
    });

    if (!existing) return ctx.notFound('Todo not found.');
    if ((existing as any).users_permissions_user?.id !== user.id) return ctx.forbidden('Forbidden.');

    await strapi.db.query('api::todo.todo').delete({ where: { id: ctx.params.id } });

    return { data: existing };
  },
}));
