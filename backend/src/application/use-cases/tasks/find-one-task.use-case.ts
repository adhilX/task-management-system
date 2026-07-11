import { ITaskRepository } from '../../../domain/repositories/task-repository.interface';
import { Task } from '../../../domain/entities/task.entity';
import { NotFoundException } from '../../../domain/errors/domain.exception';

export class FindOneTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }
}
