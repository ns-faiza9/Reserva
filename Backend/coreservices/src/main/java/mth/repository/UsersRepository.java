package mth.repository;

import mth.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {

    @Query("select U.role from Users U where U.email = :username and U.password = :password and U.status = 1")
    Object validateCredentials(@Param("username") String username, @Param("password") String password);

    @Query("select U.id from Users U where U.email = :email")
    Object checkByEmail(@Param("email") String email);

    @Query("select U from Users U where U.email = :email")
    Users findByEmail(@Param("email") String email);
}
