"use strict";

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::todo.todo",
  ({ strapi }) => ({
    async find(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("You must be logged in.");

      ctx.query.filters = {
        ...(ctx.query.filters as object),
        user: { id: { $eq: user.id } },
      };

      const { data, meta } = await super.find(ctx);
      return { data, meta };
    },

    async findOne(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("You must be logged in.");

      const { data, meta } = await super.findOne(ctx);

      const ownerId = (data as any)?.attributes?.user?.data?.id;
      if (ownerId && ownerId !== user.id) {
        return ctx.forbidden("You do not have access to this resource.");
      }

      return { data, meta };
    },

    async create(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("You must be logged in.");

      (ctx.request.body as any).data = {
        ...((ctx.request.body as any).data || {}),
        user: user.id,
      };

      const { data, meta } = await super.create(ctx);
      return { data, meta };
    },

    async update(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("You must be logged in.");

      const existing = await strapi.entityService.findOne(
        "api::todo.todo",
        ctx.params.id,
        { populate: ["user"] }
      );

      if (!existing) return ctx.notFound("Todo not found.");
      if ((existing as any).user?.id !== user.id) {
        return ctx.forbidden("You do not have permission to update this todo.");
      }

      if ((ctx.request.body as any).data) {
        delete (ctx.request.body as any).data.user;
      }

      const { data, meta } = await super.update(ctx);
      return { data, meta };
    },

    async delete(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("You must be logged in.");

      const existing = await strapi.entityService.findOne(
        "api::todo.todo",
        ctx.params.id,
        { populate: ["user"] }
      );

      if (!existing) return ctx.notFound("Todo not found.");
      if ((existing as any).user?.id !== user.id) {
        return ctx.forbidden("You do not have permission to delete this todo.");
      }

      const { data, meta } = await super.delete(ctx);
      return { data, meta };
    },
  })
);
